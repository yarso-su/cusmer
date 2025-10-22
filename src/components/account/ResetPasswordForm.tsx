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
  password: z
    .string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres.')
    .regex(
      /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
      'La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula y una letra minúscula.'
    )
})

async function resetPassword(
  data: z.infer<typeof formSchema>,
  token: string
): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/users/reset-password?token=${token}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No hemos podido restablecer tu contraseña. Por favor, inténtalo de nuevo más tarde.'
  }
}

function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (!token) {
      toast.error('No se encontró el token')
      return
    }

    setIsSubmitting(true)

    const error = await resetPassword(data, token)
    setIsSubmitting(false)

    if (error) {
      toast.error(error)
      return
    }

    form.reset()
    toast.success('Se ha restablecido tu contraseña con éxito.')

    setTimeout(() => {
      window.location.href = '/account/login'
    }, 2000)
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="lg:text-base">Contraseña</FormLabel>
                <FormControl>
                  <Input
                    className="lg:text-base"
                    type="password"
                    autoComplete="off"
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
              {isSubmitting ? 'Procesando...' : 'Restablecer'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

export default ForgotPasswordForm
