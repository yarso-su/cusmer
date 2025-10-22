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
import RegimeSelect from '../shared/RegimeSelect'
import type { Regime } from '@/lib/types'
import { UserX } from 'lucide-react'

const optionalEmail = () =>
  z
    .string()
    .transform(val => (val === '' ? undefined : val))
    .optional()
    .refine(val => !val || z.string().email().safeParse(val).success, {
      message: 'Email invalido'
    })
    .refine(val => !val || val.length <= 254, {
      message: 'Email invalido'
    })

const formSchema = z.object({
  rfc: z
    .string()
    .toUpperCase()
    .trim()
    .regex(/^(XAXX010101000|XEXX010101000|[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3})$/, {
      message: 'RFC invalido'
    }),
  razons: z
    .string()
    .min(1, { message: 'Razón social no puede estar vacía' })
    .max(254, { message: 'Razón social no puede exceder los 254 caracteres' }),
  codpos: z.preprocess(
    val => Number(val),
    z
      .number()
      .min(10000, { message: 'Código postal invalido' })
      .max(99999, { message: 'Código postal invalido' })
  ),
  email: z
    .string()
    .email({ message: 'Email invalido' })
    .min(1, { message: 'Email invalido' })
    .max(254, { message: 'Email invalido' }),
  regimen: z.string().length(3, { message: 'Regimen invalido' }),
  calle: z
    .string()
    .max(100, { message: 'La calle no puede exceder los 100 caracteres' })
    .optional(),
  numero_exterior: z
    .string()
    .max(60, {
      message: 'El número exterior no puede exceder los 60 caracteres'
    })
    .optional(),
  numero_interior: z
    .string()
    .max(60, { message: 'Número interior invalido' })
    .optional(),
  colonia: z
    .string()
    .max(80, { message: 'La colonia no puede exceder los 80 caracteres' })
    .optional(),
  ciudad: z
    .string()
    .max(80, { message: 'La ciudad no puede exceder los 80 caracteres' })
    .optional(),
  delegacion: z
    .string()
    .max(80, { message: 'La delegación no puede exceder los 80 caracteres' })
    .optional(),
  localidad: z
    .string()
    .max(80, { message: 'La localidad no puede exceder los 80 caracteres' })
    .optional(),
  estado: z
    .string()
    .max(80, { message: 'El estado no puede exceder los 80 caracteres' })
    .optional(),
  nombre: z
    .string()
    .max(80, { message: 'El nombre no puede exceder los 80 caracteres' })
    .optional(),
  apellidos: z
    .string()
    .max(80, { message: 'Los apellidos no pueden exceder los 80 caracteres' })
    .optional(),
  telefono: z
    .string()
    .optional()
    .refine(phone => !phone || phone?.length === 10, {
      message: 'El teléfono no puede exceder los 10 caracteres'
    }),
  email2: optionalEmail(),
  email3: optionalEmail()
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
    const res = await fetch(`${API_URL}/users/billing-profile`, {
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
  regimes: Array<Regime>
}

function UpdateBillingProfileForm({ regimes, defaultValues }: Props) {
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const fail = await updateProfile(data)
    setIsSubmitting(false)

    if (fail) return toast.error(fail)

    // form.reset()
    toast.success('Perfil de facturación actualizado')
  }

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-2 gap-y-4 overflow-y-auto">
            <div className="grid grid-cols-[1fr_1fr] gap-2 items-start">
              <FormField
                control={form.control}
                name="rfc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>*RFC</FormLabel>
                    <FormControl>
                      <Input placeholder="XAXX010101000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>*Correo electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="correo@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 items-start">
              <FormField
                name="razons"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>*Razón social</FormLabel>
                    <FormControl>
                      <Input placeholder="Mi empresa S.A." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="regimen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>*Regimen</FormLabel>
                    <FormControl>
                      <RegimeSelect
                        className="w-fit lg:max-w-[200px]"
                        regimes={regimes}
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="codpos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel title="Código postal">
                      *CP{' '}
                      <span className="opacity-85 hidden lg:block">
                        (Código postal)
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
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 items-start">
              <FormField
                name="calle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calle</FormLabel>
                    <FormControl>
                      <Input placeholder="Calle 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="numero_exterior"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número ext.</FormLabel>
                    <FormControl>
                      <Input placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="numero_interior"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número interior</FormLabel>
                    <FormControl>
                      <Input placeholder="2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              name="colonia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colonia</FormLabel>
                  <FormControl>
                    <Input placeholder="Colonia 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-[1fr_1fr] gap-2 items-start">
              <FormField
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input placeholder="Estado 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="ciudad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input placeholder="Ciudad 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="hidden lg:grid grid-cols-[1fr_1fr] gap-2 items-start">
              <FormField
                name="delegacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delegación</FormLabel>
                    <FormControl>
                      <Input placeholder="Delegación 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="localidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localidad</FormLabel>
                    <FormControl>
                      <Input placeholder="Localidad 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-[1fr_1fr] gap-2 items-start">
              <FormField
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ana Luisa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="apellidos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellidos</FormLabel>
                    <FormControl>
                      <Input placeholder="Garcia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      type="number"
                      placeholder="xxx-xxx-xxxx"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="hidden lg:grid grid-cols-[1fr_1fr] gap-2 items-start">
              <FormField
                name="email2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico 2</FormLabel>
                    <FormControl>
                      <Input placeholder="correo2@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Correo electrónico 3 <span></span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="correo3@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end items-end">
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

export default UpdateBillingProfileForm
