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
  }),
  password: z
    .string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres.')
    .regex(
      /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
      'La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula y una letra minúscula.'
    )
})

type Result =
  | { success: true; codeId: string }
  | { success: false; error: string; emailSent?: boolean }

async function login(data: z.infer<typeof formSchema>): Promise<Result> {
  try {
    const res = await fetch(`${API_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new BadResponseError(res)

    const content = await res.text()

    return { success: true, codeId: content }
  } catch (err) {
    if (err instanceof BadResponseError) {
      return {
        success: false,
        error: err.message,
        emailSent: err.emailSent
      }
    }

    return { success: false, error: 'Error al iniciar sesión' }
  }
}

function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const result = await login(data)
    setIsSubmitting(false)

    if (!result.success) {
      toast.error(result.error)

      if (result.emailSent) {
        setTimeout(() => {
          toast.info(
            'Te hemos enviado un correo electrónico con un enlace para verificar tu correo electrónico. Por favor, sigue el enlace para completar el proceso.',
            {
              duration: 5000
            }
          )
        }, 4000)
      }

      return
    }

    window.localStorage.setItem('auth_code_id', result.codeId)
    window.location.replace('/account/auth')
  }

  return (
    <>
      <Toaster richColors position="bottom-center" />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full pt-4 md:pt-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="lg:text-base">Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      placeholder="THCV[ahV{tUju3OLx,2oifV_"
                      className="lg:text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full flex-wrap-reverse flex  lg:flex-nowrap items-center justify-end mt-4 gap-4">
            <a
              href="/account/forgot-password/"
              className="w-full text-sm lg:text-base lg:w-auto lg:text-left text-center  hover:text-black dark:hover:text-white transition-colors duration-200"
            >
              Olvidé mi contraseña
            </a>
            <Button
              type="submit"
              className="w-full lg:w-fit lg:px-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Iniciar sesión'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

export default LoginForm
