import { API_URL } from 'astro:env/client'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Button } from '../ui/button'
import { useRef, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { BadResponseError } from '@/lib/errors'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import type { Order } from '@/lib/types'

async function updateOrder(
  id: number,
  { duration_weeks, payment_installments, ...data }: z.infer<typeof formSchema>
): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        duration_weeks: Number(duration_weeks),
        payment_installments: Number(payment_installments),
        ...data
      })
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo actualizar el servicio'
  }
}

const formSchema = z.object({
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
    value => Number(value),
    z
      .number()
      .min(2, {
        message: 'La duración debe ser mayor o igual a 2'
      })
      .max(48, { message: 'La duración no puede tener más de 48 semanas' })
      .multipleOf(2, { message: 'La duración debe ser múltiplo de 2' })
  ),
  payment_installments: z.preprocess(
    value => Number(value),
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

interface Props {
  id: number
  current: Omit<Order, 'items' | 'user' | 'id' | 'status' | 'discount'>
  ref: React.RefObject<HTMLButtonElement | null>
}

function UpdateOrderForm({ id, current, ref }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dialogCloseRef = useRef<HTMLButtonElement>(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: current
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const fail = await updateOrder(id, data)
    setIsSubmitting(false)

    if (fail) {
      toast.error(fail)
      return
    }

    const $name = document.getElementById('order-name')
    const $description = document.getElementById('order-description')
    const $tag = document.getElementById('order-tag')
    const $installments = document.getElementById('order-installments')
    const $duration = document.getElementById('order-duration')
    const $subscription = document.getElementById('subscription-span')

    if ($name) $name.textContent = data.name
    if ($description) $description.textContent = data.description
    if ($tag) $tag.textContent = data.tag
    if ($installments)
      $installments.textContent = String(data.payment_installments)
    if ($duration) $duration.textContent = String(data.duration_weeks)
    if ($subscription)
      $subscription.style.display = data.is_recurring ? 'block' : 'none'

    document.dispatchEvent(
      new CustomEvent('installments-change', {
        detail: data.payment_installments
      })
    )

    dialogCloseRef.current?.click()
    form.reset(data)

    toast.success('Se ha actualizado el servicio')
  }

  const onError = (errors: any) => {
    console.log('Form validation errors:', errors)
    toast.error('Por favor corrige los errores en el formulario')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="hidden" ref={ref}>
          <p>Actualizar</p>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)}>
            <DialogHeader>
              <DialogTitle>Actualizar servicio</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 my-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Backend en AWS EC2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Etiqueta</FormLabel>
                    <FormControl>
                      <Input placeholder="Backend en AWS EC2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detalles revelantes para el desarrollo del proyecto"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-2 items-start">
                <FormField
                  control={form.control}
                  name="duration_weeks"
                  render={({ field }) => (
                    <FormItem className="w-full">
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
                    <FormItem className="w-full">
                      <FormLabel>Número de pagos</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="portfolio_consent"
                render={({ field }) => (
                  <FormItem className="inline-flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Consentimiento de portafolio</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button ref={dialogCloseRef} variant="outline" type="button">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : 'Actualizar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateOrderForm
