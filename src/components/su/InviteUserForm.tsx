import { API_URL } from 'astro:env/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useEffect, useRef, useState } from 'react'
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
import UserRoleSelect from '../shared/UserRoleSelect'

const formSchema = z.object({
  email: z.string().email({
    message: 'Email. No válido'
  }),
  role: z
    .string()
    .refine(role => role === '1' || role === '2' || role === '3', {
      message: 'Role. No válido'
    })
})

async function sendRequest({
  email,
  role
}: z.infer<typeof formSchema>): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/users/send-register-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email,
        role: parseInt(role)
      })
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo enviar la solicitud'
  }
}

function InviteUserForm() {
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      role: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const fail = await sendRequest(data)
    setIsSubmitting(false)

    if (fail) return toast.error(fail)

    form.reset()
    toast.success('Se ha enviado la solicitud')
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        submitButtonRef.current?.click()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full grid grid-rows-[1fr_auto] gap-2"
      >
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-2 items-start">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <FormControl>
                    <UserRoleSelect
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
        </div>
        <div className="flex justify-end items-end">
          <Button
            ref={submitButtonRef}
            type="submit"
            disabled={isSubmitting}
            className="w-full lg:w-fit lg:px-12 inline-flex items-center gap-2"
          >
            <p>{isSubmitting ? 'Procesando...' : 'Enviar invitación'}</p>
            <span className="opacity-85 hidden lg:block">
              {isSubmitting ? '' : '(Ctrl + Enter)'}
            </span>
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default InviteUserForm
