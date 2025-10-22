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
import UserSelect from '../shared/UserSelect'
import { Textarea } from '../ui/textarea'
import { Tag, User } from 'lucide-react'
import { Checkbox } from '../ui/checkbox'
import RDivider from '../shared/RDivider'

const formSchema = z.object({
  user_id: z.string().uuid({ message: 'Cliente. No válido' }),
  name: z
    .string()
    .min(6, {
      message: 'El nombre debe tener al menos 6 caracteres.'
    })
    .max(60, { message: 'El nombre no puede tener más de 60 caracteres' }),
  description: z
    .string()
    .min(12, {
      message: 'El contenido debe tener al menos 12 caracteres.'
    })
    .max(240, { message: 'El contenido no puede tener más de 240 caracteres' }),
  tag: z
    .string()
    .min(6, {
      message: 'La etiqueta debe tener al menos 6 caracteres.'
    })
    .max(60, { message: 'La etiqueta no puede tener más de 60 caracteres' }),

  duration_weeks: z.preprocess(
    val => Number(val),
    z
      .number()
      .min(2, {
        message: 'La duración debe ser mayor o igual a 2'
      })
      .max(48, { message: 'La duración no puede tener más de 48 semanas' })
      .multipleOf(2, { message: 'La duración debe ser múltiplo de 2' })
  ),
  payment_installments: z.preprocess(
    val => Number(val),
    z
      .number()
      .min(1, {
        message: 'El número de cuotas debe ser mayor o igual a 1'
      })
      .max(12, {
        message: 'El número de cuotas no puede tener más de 12 cuotas'
      })
  ),
  is_recurring: z.boolean(),
  portfolio_consent: z.boolean()
})

async function create(
  data: z.infer<typeof formSchema>
): Promise<
  { success: true; id: number } | { success: false; message: string }
> {
  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new BadResponseError(res)

    const content = await res.json()
    return { success: true, id: content.id }
  } catch (err) {
    if (err instanceof BadResponseError)
      return { success: false, message: err.message }
    return { success: false, message: 'No se pudo crear el servicio' }
  }
}

interface Props {
  data:
    | {
        user: { id: string; name: string }
        users: null
      }
    | {
        user: null
        users: Array<{ id: string; name: string }>
      }
}

function CreateOrderForm({ data: { user, users } }: Props) {
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: user?.id ?? '',
      name: '',
      description: '',
      tag: '',
      duration_weeks: 2,
      payment_installments: 1,
      is_recurring: false,
      portfolio_consent: false
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const res = await create(data)
    setIsSubmitting(false)

    if (!res.success) return toast.error(res.message)

    form.reset()
    toast.success('Servicio creado')
    window.location.href = `/su/services/${res.id}`
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
          <div>
            <div>
              <span className="inline-flex items-center gap-2">
                <Tag className="h-[1.2rem] w-[1.2rem] scale-100 text-contrast" />
                <h2 className="text-xl font-semibold tracking-tight">
                  Información general
                </h2>
              </span>
              <p className="opacity-85">Datos principales del servicio</p>
            </div>
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-2 mb-4 lg:mb-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mi negocio nueva landing"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiqueta</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Landing page"
                        type="text"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles revelantes para el desarrollo del proyecto"
                      className="resize-none max-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="my-6">
            <RDivider />
          </div>
          <div>
            <div>
              <span className="inline-flex items-center gap-2">
                <User className="h-[1.2rem] w-[1.2rem] scale-100 text-contrast" />
                <h2 className="text-xl font-semibold tracking-tight">
                  Cliente y Configuración
                </h2>
              </span>
              <p className="opacity-85">Asignación y parámetros del servicio</p>
            </div>
            <div className="mt-4">
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <FormControl>
                      {user ? (
                        <Input
                          value={user.name}
                          contentEditable={false}
                          readOnly
                        />
                      ) : (
                        <UserSelect
                          users={users}
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 lg:mt-6 items-start">
              <FormField
                control={form.control}
                name="duration_weeks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (semanas)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment_installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de pagos</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <FormField
            control={form.control}
            name="portfolio_consent"
            render={({ field }) => (
              <FormItem className="inline-flex gap-2 items-center mt-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div>
                  <FormLabel>Consentimiento de portafolio</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
        <div className="w-full flex justify-end items-center">
          <Button
            ref={submitButtonRef}
            type="submit"
            className="w-full lg:w-fit lg:px-12 inline-flex items-center gap-2"
            disabled={isSubmitting}
          >
            <p>{isSubmitting ? 'Procesando...' : 'Crear servicio'}</p>
            <span className="opacity-85 hidden lg:block">
              {isSubmitting ? '' : '(Ctrl + Enter)'}
            </span>
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default CreateOrderForm
