import { API_URL } from 'astro:env/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { BadResponseError } from '@/lib/errors'

const formSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: 'El nombre debe tener al menos 3 caracteres.'
    })
    .max(60, { message: 'El nombre no puede tener más de 60 caracteres.' }),
  email: z.string().email({
    message: 'Debes ingresar un correo electrónico válido.'
  }),
  message: z
    .string()
    .min(2, {
      message: 'La información adicional debe tener al menos 2 caracteres.'
    })
    .max(240, {
      message: 'La información adicional no puede tener más de 240 caracteres.'
    })
})

async function contact(data: z.infer<typeof formSchema>): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new BadResponseError(res)

    return true
  } catch {
    return false
  }
}

function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const success = await contact(data)
    setIsSubmitting(false)

    if (!success) {
      toast.error('Error al enviar el mensaje')
      return
    }

    toast.success('¡Mensaje enviado correctamente!')
    form.reset()
  }

  return (
    <>
      <Toaster richColors position="bottom-center" />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm leading-tight lg:text-base">
                    Nombre
                    <span translate="no" className="opacity-80">
                      (Name)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      className="text-xs lg:text-base"
                      placeholder="Ana García López"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm leading-tight lg:text-base">
                    Correo
                    <span translate="no" className="opacity-80">
                      (E-mail)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      className="text-xs lg:text-base"
                      placeholder="ana.garcia@empresa.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm leading-tight lg:text-base">
                  Información adicional
                  <span translate="no" className="opacity-80">
                    (Additional information)
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Información que consideres importante para tu proyecto..."
                    className="text-xs lg:text-base resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              className="w-full lg:w-auto lg:px-16"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

export default ContactForm
