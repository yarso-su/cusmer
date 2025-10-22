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
import { Checkbox } from '../ui/checkbox'
import { CUSTOMER_RESPONSE_HEADERS } from '@/lib/constants'

const formSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: 'El nombre debe tener al menos 3 caracteres.'
    })
    .max(60, {
      message: 'El nombre no puede tener más de 60 caracteres.'
    }),
  password: z
    .string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres.')
    .regex(
      /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
      'La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula y una letra minúscula.'
    ),
  termsAndPoliciesAccepted: z.boolean().refine(value => !!value, {
    message: 'Debes aceptar los términos y condiciones'
  })
})

type Result =
  | { success: true; emailSent: boolean }
  | { success: false; error: string }

async function register(
  data: z.infer<typeof formSchema>,
  token: string
): Promise<Result> {
  try {
    const res = await fetch(`${API_URL}/users?token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new BadResponseError(res)

    return {
      success: true,
      emailSent: res.headers.has(CUSTOMER_RESPONSE_HEADERS.EMAIL_SENT)
    }
  } catch (err) {
    if (err instanceof BadResponseError) {
      return { success: false, error: err.message }
    }

    return { success: false, error: 'Error al intentar registrar al usuario' }
  }
}

function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      password: '',
      termsAndPoliciesAccepted: false
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

    const result = await register(data, token)
    setIsSubmitting(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    form.reset()
    toast.success('¡Registro exitoso!')

    if (result.emailSent) {
      toast.info(
        'Se ha enviado un correo electrónico con un enlace de verificación',
        {
          duration: 10000
        }
      )
    }

    setTimeout(() => {
      window.location.href = '/account/login'
    }, 10000)
  }

  return (
    <>
      <Toaster richColors position="bottom-center" />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full pt-4 md:pt-8"
        >
          <div className="flex flex-col gap-4 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="lg:text-base">Nombre</FormLabel>
                    <FormControl>
                      <Input
                        className="lg:text-base"
                        autoComplete="name"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="lg:text-base">Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        className="lg:text-base"
                        type="password"
                        autoComplete="current-password"
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
              name="termsAndPoliciesAccepted"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div>
                    <FormLabel className="text-nowrap flex-wrap">
                      He leído y acepto los
                      <a
                        className="text-contrast hover:underline"
                        target="_blank"
                        href="/legal/terms/"
                      >
                        Términos y Condiciones
                      </a>
                      y la
                      <a
                        className="text-contrast hover:underline"
                        target="_blank"
                        href="/legal/policies/"
                      >
                        Política de Privacidad
                      </a>
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button
              type="submit"
              className="w-full lg:w-fit lg:px-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Registrarse'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

export default RegisterForm
