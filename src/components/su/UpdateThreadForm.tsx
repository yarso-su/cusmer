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
import ThreadTypeSelect from '../shared/ThreadTypeSelect'
import ThreadStatusSelect from '../shared/ThreadStatusSelect'
import { Edit } from 'lucide-react'
import { THREAD_STATUSES, THREAD_TYPES } from '@/lib/constants'

async function updateThread(
  data: z.infer<typeof formSchema>,
  id: number
): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/threads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: data.name,
        type: data.type ? Number(data.type) : undefined,
        status: data.status ? Number(data.status) : undefined
      })
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo actualizar el hilo'
  }
}

const formSchema = z.object({
  name: z
    .string()
    .min(4, {
      message: 'El nombre debe tener al menos 4 caracteres.'
    })
    .max(60, { message: 'El nombre no puede tener más de 60 caracteres' }),

  type: z.string().refine(
    val => {
      const n = Number(val)

      return !isNaN(n) && n > 0 && n < 11
    },
    {
      message: 'Tipo de servicio no válido'
    }
  ),
  status: z.string().refine(
    val => {
      const n = Number(val)

      return !isNaN(n) && n > 0 && n < 4
    },
    {
      message: 'Estado de servicio no válido'
    }
  )
})

interface Props {
  thread: {
    id: number
    name: string
    type: number
    status: number
  }
}

function UpdateThreadForm({ thread }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dialogCloseRef = useRef<HTMLButtonElement>(null)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: thread.name,
      type: String(thread.type),
      status: String(thread.status)
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const fail = await updateThread(data, thread.id)
    setIsSubmitting(false)

    if (fail) return toast.error(fail)

    const $name = document.getElementById('thread-name')
    const $type = document.getElementById('thread-type')
    const $status = document.getElementById('thread-status')

    if ($name) $name.textContent = data.name
    if ($type) $type.textContent = THREAD_TYPES[Number(data.type)]
    if ($status) $status.textContent = THREAD_STATUSES[Number(data.status)]
    // if (Number(data.status) !== THREAD_STATUSES_KEYS.OPEN) {
    //   return
    // }

    form.reset({
      name: thread.name,
      type: String(thread.type),
      status: String(thread.status)
    })
    dialogCloseRef.current?.click()

    toast.success('Se ha actualizado el hilo')
    window.location.reload()
    // document.dispatchEvent(new Event('status:update-to-open'))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="opacity-100 hover:opacity-60 transition-opacity duration-200">
          <Edit className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="notification">
            <DialogHeader>
              <DialogTitle>Actualizar hilo</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 lg:gap-2 my-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Titulo</FormLabel>
                    <FormControl>
                      <Input
                        autoFocus={false}
                        placeholder="Sobre mi nuevo proyecto"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <ThreadTypeSelect
                        className="w-full"
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <ThreadStatusSelect
                        className="w-full"
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button ref={dialogCloseRef} variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : 'Actualizar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateThreadForm
