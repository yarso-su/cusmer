import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { File, Image, Paperclip, Trash } from 'lucide-react'
import { ScrollArea } from '../ui/scroll-area'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { BadResponseError } from '@/lib/errors'
import { API_URL } from 'astro:env/client'
import { format } from '@formkit/tempo'
import { THREAD_STATUSES_KEYS } from '@/lib/constants'

// IMPORTANT: Update bucket.your-domain.com with your bucket domain

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']

async function getPresignedUrlData(
  id: number,
  data: { ext: string; mime: string }
): Promise<
  | { success: true; data: { url: string; key: string } }
  | { success: false; error: string }
> {
  try {
    const res = await fetch(
      `${API_URL}/threads/${id}/attachments/presigned-url`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      }
    )

    if (!res.ok) throw new BadResponseError(res)

    const body = await res.json()

    return { success: true, data: body }
  } catch (err) {
    if (err instanceof BadResponseError)
      return { success: false, error: err.message }

    return { success: false, error: 'No se pudo cargar el archivo' }
  }
}

async function uploadFile(url: string, file: File): Promise<void | string> {
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file
    })

    if (!res.ok) throw new Error('Error while uploading file')
  } catch (err) {
    return 'No se pudo cargar el archivo'
  }
}

async function save(
  id: number,
  filename: string
): Promise<
  { success: true; created_at: string } | { success: false; error: string }
> {
  try {
    const res = await fetch(
      `${API_URL}/threads/${id}/attachments?filename=${filename}`,
      {
        method: 'POST',
        credentials: 'include'
      }
    )

    if (!res.ok) throw new BadResponseError(res)

    const body = await res.json()

    return { success: true, created_at: body.created_at }
  } catch (err) {
    if (err instanceof BadResponseError)
      return { success: false, error: err.message }

    return { success: false, error: 'No se pudo guardar el archivo' }
  }
}

async function deleteFile(
  id: number,
  filename: string
): Promise<void | string> {
  try {
    const res = await fetch(
      `${API_URL}/threads/${id}/attachments?filename=${filename}`,
      {
        method: 'DELETE',
        credentials: 'include'
      }
    )

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message

    return 'No se pudo eliminar el archivo'
  }
}

interface Props {
  id: number
  status: number
  list: Array<{ filename: string; belongsToUser: boolean; created_at: string }>
}

function Attachments({ id, status, list: currentList }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [list, setList] =
    useState<
      Array<{ filename: string; belongsToUser: boolean; created_at: string }>
    >(currentList)
  const [ready, setReady] = useState(true)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (!ready) {
      toast.error('Un archivo sigue siendo procesado')
      return
    }

    setReady(false)

    try {
      const file = e.target.files?.[0]
      if (!file) throw new Error('Error while loading file')

      if (file.size > 1024 * 1024 * 10) {
        toast.error('El archivo es demasiado grande')
        e.target.value = ''

        return
      }

      const ext = file.name.split('.')[1]
      if (!ext) throw new Error('Error while loading file')

      const loading = toast.loading('Procesando...')
      const presigned = await getPresignedUrlData(id, {
        ext,
        mime: file.type
      })

      if (!presigned.success) {
        toast.dismiss(loading)
        toast.error(presigned.error)

        return
      }

      const failUpload = await uploadFile(presigned.data.url, file)
      if (failUpload) {
        toast.dismiss(loading)
        toast.error(failUpload)

        return
      }

      const saveRes = await save(id, presigned.data.key)
      toast.dismiss(loading)

      if (!saveRes.success) return toast.error(saveRes.error)

      setList([
        ...list,
        {
          filename: presigned.data.key,
          belongsToUser: true,
          created_at: saveRes.created_at
        }
      ])
      toast.success('Archivo cargado correctamente')
    } catch (err) {
      toast.error('No se pudo cargar el archivo')
    } finally {
      e.target.value = ''
      setReady(true)
    }
  }

  const handleDelete = async (filename: string) => {
    const loading = toast.loading('Eliminando...')
    const fail = await deleteFile(id, filename)
    toast.dismiss(loading)

    if (fail) return toast.error(fail)

    toast.success('Eliminado')
    setList(list.filter(item => item.filename !== filename))
  }

  if (status !== THREAD_STATUSES_KEYS.OPEN) return null

  return (
    <div className="pl-2 cborder-l flex items-center">
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="opacity-100 hover:opacity-60 transition-opacity duration-200"
          >
            <Paperclip className="size-4 opacity-100 hover:opacity-60 transition-opacity duration-200" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adjuntos</DialogTitle>
            <DialogDescription>
              Carga los archivos que consideres relevantes para el hilo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <ScrollArea className="rounded-sm border max-h-[200px]">
              {list.length < 1 ? (
                <p className="py-1 text-center text-sm opacity-75">
                  No hay archivos adjuntos
                </p>
              ) : (
                list.map((item, index) => {
                  const ext = item.filename.split('.')[1] ?? 'unknown'
                  const isImage = IMAGE_EXTENSIONS.includes(ext)

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-[1fr_auto] items-center gap-2 p-2"
                    >
                      <a
                        href={`https://bucket.your-domain.com/${item.filename}`}
                        target="_blank"
                        className="flex items-center gap-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-sm transition-colors  duration-200"
                      >
                        {isImage ? (
                          <Image className="size-3 opacity-85" />
                        ) : (
                          <File className="size-3 opacity-85 " />
                        )}
                        <p className="text-sm opacity-85 ">
                          {isImage ? 'Imagen' : 'Documento'}
                        </p>
                        <div className="pl-2 cborder-l">
                          <p className="text-sm opacity-85">
                            {format(
                              item.created_at,
                              { date: 'short', time: 'medium' },
                              'es'
                            )}
                          </p>
                        </div>
                      </a>
                      {item.belongsToUser ? (
                        <button
                          onClick={() => handleDelete(item.filename)}
                          className="opacity-100 hover:opacity-70 transition-opacity duration-200"
                        >
                          <Trash className="size-3 " />
                        </button>
                      ) : (
                        <div />
                      )}
                    </div>
                  )
                })
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="button" onClick={() => inputRef?.current?.click()}>
              Cargar archivo
            </Button>
            <input
              onChange={handleChange}
              ref={inputRef}
              type="file"
              className="hidden"
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Attachments
