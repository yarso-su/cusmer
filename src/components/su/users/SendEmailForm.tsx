import { API_URL } from 'astro:env/client'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { useRef, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { BadResponseError } from '@/lib/errors'
import { Textarea } from '@/components/ui/textarea'

async function sendNotification(
  id: string,
  data: z.infer<typeof formSchema>
): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/users/${id}/send-notification`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo enviar la notificación'
  }
}

const formSchema = z.object({
  content: z
    .string()
    .min(8, {
      message: 'El contenido debe tener al menos 8 caracteres.'
    })
    .max(240, { message: 'El contenido no puede tener más de 240 caracteres' })
})

interface Props {
  id: string
  ref: React.RefObject<HTMLButtonElement | null>
}

function SendNotificationForm({ id, ref }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dialogCloseRef = useRef<HTMLButtonElement>(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const fail = await sendNotification(id, data)
    setIsSubmitting(false)

    if (fail) {
      toast.error(fail)
      return
    }

    dialogCloseRef.current?.click()
    form.reset(data)

    toast.success('Correo enviado')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="hidden" ref={ref}>
          <p>Enviar</p>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Enviar correo</DialogTitle>
              <DialogDescription>
                Envia un correo electrónico personalizado para notificar al
                usuario sobre temas relacionados con su cuenta.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 my-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Contenido</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Correo personalizado"
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
                {isSubmitting ? 'Procesando...' : 'Enviar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default SendNotificationForm
