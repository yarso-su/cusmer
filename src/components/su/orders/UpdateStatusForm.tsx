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
import { Button } from '@/components/ui/button'
import { useRef, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { BadResponseError } from '@/lib/errors'
import OrderStatusSelect from '@/components/shared/OrderStatusSelect'
import { ORDER_STATUSES } from '@/lib/constants'

async function updateStatus(
  id: number,
  data: z.infer<typeof formSchema>
): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo asignar el descuento'
  }
}

const formSchema = z.object({
  status: z.preprocess(
    value => Number(value),
    z
      .number()
      .min(1, {
        message: 'Debes seleccionar un estado válido'
      })
      .max(100, {
        message: 'Debes seleccionar un estado válido'
      })
  )
})

interface Props {
  id: number
  ref: React.RefObject<HTMLButtonElement | null>
}

function UpdateStatusForm({ id, ref }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dialogCloseRef = useRef<HTMLButtonElement>(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const fail = await updateStatus(id, data)
    setIsSubmitting(false)

    if (fail) {
      toast.error(fail)
      return
    }

    const $status = document.getElementById('order-status')
    if ($status) $status.textContent = ORDER_STATUSES[data.status]

    dialogCloseRef.current?.click()
    form.reset(data)

    const event = new CustomEvent('status-change', {
      detail: data.status
    })

    document.dispatchEvent(event)
    toast.success('Estado actualizado')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="hidden" ref={ref}>
          <p>Asignar</p>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Cambiar estado</DialogTitle>
            </DialogHeader>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="my-6 w-full">
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <OrderStatusSelect
                      className="w-full"
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button ref={dialogCloseRef} variant="outline" type="button">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : 'Cambiar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateStatusForm
