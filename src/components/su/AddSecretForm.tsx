import { API_URL } from 'astro:env/client'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Button } from '../ui/button'
import { useRef, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { BadResponseError } from '@/lib/errors'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import {
  COMMON_ERRORS,
  CryptoError,
  importPublicKey,
  safeEncryptSecret
} from '@/lib/crypto'

async function addSecret(
  id: string | undefined,
  label: string,
  secret: {
    key: string
    content: string
    iv: string
  }
): Promise<
  | { success: true; data: { id: number; updated_at: string } }
  | { success: false; error: string }
> {
  try {
    const res = await fetch(`${API_URL}/users/secrets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        label,
        ...secret,
        receiver_id: id
      })
    })

    if (!res.ok) throw new BadResponseError(res)

    const body = await res.json()
    return { success: true, data: body }
  } catch (err) {
    if (err instanceof BadResponseError) {
      return { success: false, error: err.message }
    }

    return { success: false, error: 'No se pudo agregar el item' }
  }
}

const formSchema = z.object({
  label: z
    .string()
    .min(4, {
      message: 'La etiqueta debe tener al menos 4 caracteres.'
    })
    .max(60, { message: 'La etiqueta no puede tener más de 60 caracteres' })
    .trim(),
  content: z
    .string()
    .min(4, { message: 'El contenido debe tener al menos 4 caracteres' })
    .max(400, {
      message: 'El contenido no puede tener más de 400 caracteres'
    })
    .trim()
})

interface Props {
  id?: string
  publicKey: string | undefined
  onSecretAdded: (secret: {
    id: number
    label: string
    key: string
    content: string
    iv: string
    updated_at: string
  }) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

function AddSecretForm({
  id,
  publicKey: loadedKey,
  onSecretAdded,
  triggerRef
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dialogCloseRef = useRef<HTMLButtonElement>(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      content: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!loadedKey) {
      toast.error(
        'No encontramos la clave para poder enviar cifrar credenciales. Puedes crear un hilo para reportar este problema.',
        {
          duration: 5000
        }
      )
      return
    }

    setIsSubmitting(true)

    try {
      const publicKey = await importPublicKey(loadedKey) // NOTE: This could be cached
      const encrypted = await safeEncryptSecret(data.content, publicKey)

      const res = await addSecret(id, data.label, encrypted)
      setIsSubmitting(false)

      if (!res.success) {
        toast.error(res.error)
        return
      }

      toast.success('Entrada registrada')

      onSecretAdded({
        id: res.data.id,
        label: data.label,
        key: encrypted.key,
        content: encrypted.content,
        iv: encrypted.iv,
        updated_at: res.data.updated_at
      })

      dialogCloseRef.current?.click()
      form.reset()
    } catch (err) {
      setIsSubmitting(false)

      if (err instanceof CryptoError) {
        toast.error(COMMON_ERRORS[err.code] ?? 'Error al agregar la entrada')
        return
      }

      toast.error('Error al agregar la entrada')
    }
  }

  const onError = (errors: any) => {
    console.log('Form validation errors:', errors)
    toast.error('Por favor corrige los errores en el formulario')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button ref={triggerRef} className="hidden">
          Editar
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)}>
            <DialogHeader>
              <DialogTitle>Agregar articulo</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 lg:gap-2 my-6">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Etiqueta</FormLabel>
                    <FormControl>
                      <Input placeholder="Namecheap contraseña" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Contenido</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Texto a encriptar"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button ref={dialogCloseRef} variant="outline" type="button">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : 'Agregar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddSecretForm
