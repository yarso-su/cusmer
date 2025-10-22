import { API_URL } from 'astro:env/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import type { Country } from '@/lib/types'
import CountrySelect from '../shared/CountrySelect'
import { UserX } from 'lucide-react'

const formSchema = z.object({
  razons: z
    .string()
    .min(1, { message: 'Razón social no puede estar vacía' })
    .max(254, { message: 'Razón social no puede exceder los 254 caracteres' }),
  codpos: z
    .number()
    .min(10000, { message: 'Código postal invalido' })
    .max(99999, { message: 'Código postal invalido' }),
  email: z
    .string()
    .email({ message: 'Email invalido' })
    .min(1, { message: 'Email invalido' })
    .max(254, { message: 'Email invalido' }),
  pais: z
    .string()
    .min(2, { message: 'País invalido' })
    .max(6, { message: 'País invalido' })
})

async function deleteProfile(): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/users/billing-profile`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo eliminar el perfil de facturación'
  }
}

async function updateProfile(
  data: z.infer<typeof formSchema>
): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/users/billing-profile-foreign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        client: data
      })
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo actualizar el perfil de facturación'
  }
}

interface Props {
  defaultValues: z.infer<typeof formSchema>
  countries: Array<Country>
}

function UpdateBillingForeignProfileForm({ countries, defaultValues }: Props) {
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues
  })

  const handleDelete = useCallback(async () => {
    toast('Estas seguro que deseas eliminar tu perfil de facturación?', {
      dismissible: true,
      duration: 5000,
      action: {
        label: 'Si',
        onClick: async () => {
          const loading = toast.loading('Eliminando...')

          const fail = await deleteProfile()
          toast.dismiss(loading)
          if (fail) return toast.error(fail)

          toast.success('Perfil de facturación eliminado')
          window.location.href = '/platform'
        }
      },
      cancel: {
        label: 'No',
        onClick: () => {
          toast.dismiss()
          return
        }
      }
    })
  }, [])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const fail = await updateProfile(data)
    setIsSubmitting(false)

    if (fail) return toast.error(fail)

    // form.reset()
    toast.success('Perfil de facturación creado')
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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-x-2 gap-y-4 overflow-y-auto">
            <FormField
              name="regimen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pais{' '}
                    <span translate="no" className="opacity-85">
                      (Country)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <CountrySelect
                      className="w-full"
                      countries={countries}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-[1fr_1fr] gap-2 items-start">
              <FormField
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Correo electrónico{' '}
                      <span translate="no" className="opacity-85">
                        (E-mail)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="correo@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="razons"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nombre completo{' '}
                      <span translate="no" className="opacity-85">
                        (Full name)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Mi empresa S.A." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              name="codpos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Código postal{' '}
                    <span translate="no" className="opacity-85">
                      (Postal code)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      type="number"
                      placeholder="xxxxx"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end items-end gap-2 ">
          <div className="w-full lg:w-auto grid grid-cols-[auto_1fr] gap-2">
            <Button
              ref={submitButtonRef}
              type="submit"
              disabled={isSubmitting}
              className="w-full lg:w-fit lg:px-12 inline-flex items-center gap-2"
            >
              <p>{isSubmitting ? 'Procesando...' : 'Actualizar perfil'}</p>
              <span className="opacity-85 hidden lg:block">
                {isSubmitting ? '' : '(Ctrl + Enter)'}
              </span>
            </Button>
            <Button
              size="icon"
              variant="custom"
              title="Eliminar perfil de facturación"
              onClick={handleDelete}
              type="button"
            >
              <UserX className="size-4" />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default UpdateBillingForeignProfileForm
