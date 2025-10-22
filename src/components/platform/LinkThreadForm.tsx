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
import { toast } from 'sonner'
import { BadResponseError } from '@/lib/errors'
import OrderSelect from '../shared/OrderSelect'
import type { OrderSummary } from '@/lib/types'

const formSchema = z.object({
  order_id: z.preprocess(val => Number(val), z.number().int().positive())
})

async function link(
  id: number,
  data: z.infer<typeof formSchema>
): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/threads/${id}/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo crear la relación'
  }
}

interface Props {
  id: number
  orders: Array<OrderSummary>
}

function LinkThreadForm({ id, orders }: Props) {
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      order_id: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const fail = await link(id, data)
    setIsSubmitting(false)

    if (fail) return toast.error(fail)

    form.reset()
    toast.success('Hilo vinculado')
    window.location.href = `/platform/threads/${id}`
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
          <FormField
            control={form.control}
            name="order_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Servicio</FormLabel>
                <FormControl>
                  <OrderSelect
                    className="w-full"
                    orders={orders}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end items-end">
          <Button
            ref={submitButtonRef}
            type="submit"
            disabled={isSubmitting}
            className="w-full lg:w-fit lg:px-12 inline-flex items-center gap-2"
          >
            <p>{isSubmitting ? 'Procesando...' : 'Vincular hilo'}</p>
            <span className="opacity-85 hidden lg:block">
              {isSubmitting ? '' : '(Ctrl + Enter)'}
            </span>
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default LinkThreadForm
