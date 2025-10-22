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
import { toast } from 'sonner'
import { BadResponseError } from '@/lib/errors'

const formSchema = z.object({
  email: z.string().email({
    message: 'Debes ingresar un correo electrónico válido.'
  })
})

async function forgotPassword(
  data: z.infer<typeof formSchema>
): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/users/send-reset-password-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) {
      return err.message
    }

    return 'No hemos podido enviar el correo electrónico. Por favor, inténtalo de nuevo más tarde.'
  }
}

function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const fail = await forgotPassword(data)
    setIsSubmitting(false)

    if (fail) {
      toast.error(fail)
      return
    }

    form.reset()
    toast.success(
      'Se ha enviado un correo electrónico con un enlace para restablecer tu contraseña.',
      {
        duration: 7000
      }
    )
  }

  return (
    <>
      <Toaster richColors position="bottom-center" />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full pt-4 md:pt-8"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="lg:text-base">
                  Correo electrónico
                </FormLabel>
                <FormControl>
                  <Input
                    className="lg:text-base"
                    autoComplete="email"
                    placeholder="ana.garcia@empresa.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end mt-4">
            <Button
              type="submit"
              className="w-full lg:w-fit lg:px-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Enviar correo electrónico'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

export default ForgotPasswordForm
