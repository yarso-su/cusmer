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
import OrderSelect from '../shared/OrderSelect'
import ThreadTypeSelect from '../shared/ThreadTypeSelect'

const formSchema = z.object({
  name: z
    .string()
    .min(4, { message: 'El nombre debe tener al menos 4 caracteres' })
    .max(60, { message: 'El nombre no puede tener más de 60 caracteres' }),
  type: z.string().refine(
    val => {
      const n = Number(val)

      return !isNaN(n) && n > 0 && n < 11
    },
    {
      message: 'Tipo de hilo no válido'
    }
  ),
  order_id: z
    .string()
    .refine(
      val => {
        const n = Number(val)
        return !isNaN(n) && n % 1 === 0
      },
      {
        message: 'Id de servicio no válido'
      }
    )
    .optional()
})

async function createThread({
  name,
  type,
  order_id
}: z.infer<typeof formSchema>): Promise<
  { success: true; id: number } | { success: false; message: string }
> {
  try {
    const res = await fetch(`${API_URL}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name,
        type: Number(type),
        order_id: order_id ? Number(order_id) : undefined
      })
    })

    if (!res.ok) throw new BadResponseError(res)

    const data = await res.json()
    return { success: true, id: data.id }
  } catch (err) {
    if (err instanceof BadResponseError)
      return { success: false, message: err.message }

    return { success: false, message: 'No se pudo crear el hilo' }
  }
}

interface Props {
  preselectedType?: string
  data:
    | {
        order: { id: number; name: string }
        orders: null
      }
    | {
        order: null
        orders: Array<{ id: number; name: string }>
      }
}

function CreateThreadForm({ preselectedType, data }: Props) {
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: preselectedType ?? '',
      order_id: data?.order !== null ? String(data.order.id) : ''
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const res = await createThread(data)
    setIsSubmitting(false)

    if (!res.success) return toast.error(res.message)

    form.reset()
    toast.success('Se ha creado el hilo')
    window.location.href = `/platform/threads/${res.id}`
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
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-2 items-start">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Titulo</FormLabel>
                  <FormControl>
                    <Input placeholder="Sobre mi nuevo proyecto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 w-full items-start">
              {preselectedType === undefined && (
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <ThreadTypeSelect
                          className="w-full"
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {data?.order === null && data?.orders !== null && (
                <FormField
                  control={form.control}
                  name="order_id"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>
                        Servicio{' '}
                        <span className="opacity-65 text-xs">(Opcional)</span>
                      </FormLabel>
                      <FormControl>
                        <OrderSelect
                          className="w-full"
                          orders={data.orders}
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        </div>
        <div className="w-full flex justify-end items-center">
          <Button
            type="submit"
            disabled={isSubmitting}
            ref={submitButtonRef}
            className="w-full lg:w-fit lg:px-12 inline-flex items-center gap-2"
          >
            <p>{isSubmitting ? 'Procesando...' : 'Crear hilo'}</p>
            <span className="opacity-85 hidden lg:block">
              {isSubmitting ? '' : '(Ctrl + Enter)'}
            </span>
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default CreateThreadForm
