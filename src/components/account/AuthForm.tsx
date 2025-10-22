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
  FormMessage
} from '@/components/ui/form'
import { toast } from 'sonner'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from '@/components/ui/input-otp'
import { BadResponseError } from '@/lib/errors'
import { ROLES } from '@/lib/constants'

const formSchema = z.object({
  code: z.string({
    message: 'Código de verificación. Debe ser válido.'
  })
})

async function regenerateCode(
  id: string
): Promise<
  { success: true; codeId: string } | { success: false; error: string }
> {
  try {
    const res = await fetch(`${API_URL}/sessions/verification-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id
      })
    })

    if (!res.ok) throw new BadResponseError(res)

    const codeId = await res.text()

    return { success: true, codeId }
  } catch (err) {
    if (err instanceof BadResponseError)
      return { success: false, error: err.message }
    return { success: false, error: 'Error al enviar el código' }
  }
}

type Result =
  | {
      success: true
      user: {
        name: string
        email: string
        role: number
      }
    }
  | { success: false; error: string }

async function validateCode(
  data: z.infer<typeof formSchema>,
  id: string
): Promise<Result> {
  try {
    const res = await fetch(`${API_URL}/sessions?code_id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new BadResponseError(res)

    const content = await res.json()

    return { success: true, user: content.user }
  } catch (err) {
    if (err instanceof BadResponseError) {
      return {
        success: false,
        error: err.message
      }
    }

    return { success: false, error: 'Error al validar el código' }
  }
}

function AuthForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRegenerateCodeClick = async () => {
    const codeId = window.localStorage.getItem('auth_code_id')
    if (codeId === null) return window.location.replace('/account/login')

    const loading = toast.loading('Generando el código de verificación...')
    const result = await regenerateCode(codeId)
    toast.dismiss(loading)
    if (!result.success) return toast.error(result.error)

    window.localStorage.setItem('auth_code_id', result.codeId)
    toast.success('¡Se ha enviado el código de verificación nuevamente!')
  }

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const codeId = window.localStorage.getItem('auth_code_id')
    if (codeId === null) {
      toast.error('Parece que hubo un error al iniciar sesión')
      window.location.replace('/account/login')
      return
    }

    setIsSubmitting(true)

    const result = await validateCode(data, codeId)
    setIsSubmitting(false)

    if (!result.success) return toast.error(result.error)

    window.localStorage.setItem('user_name', result.user.name)
    window.localStorage.setItem('user_email', result.user.email)
    window.localStorage.setItem('user_role', result.user.role.toString())

    window.location.replace(
      result.user.role === ROLES.CLIENT ? '/platform' : '/su'
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
          <div className="mx-auto flex justify-center pb-8 lg:pb-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      {...field}
                      aria-label="Código de verificación"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full flex-wrap-reverse flex  lg:flex-nowrap items-center justify-end mt-4 gap-4">
            <button
              onClick={handleRegenerateCodeClick}
              type="button"
              className="w-full text-sm lg:text-base lg:w-auto lg:text-left text-center  hover:text-black dark:hover:text-white transition-colors duration-200"
            >
              Reenviar el código
            </button>
            <Button
              type="submit"
              className="w-full lg:w-fit lg:px-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Verificar'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

export default AuthForm
