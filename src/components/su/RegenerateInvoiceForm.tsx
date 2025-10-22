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

const formSchema = z.object({
  payment: z.preprocess(val => Number(val), z.number().min(1).int())
})

async function regenerateInvoice({
  payment
}: z.infer<typeof formSchema>): Promise<void | string> {
  try {
    const res = await fetch(
      `${API_URL}/payments/${payment}/regenerate-invoice`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      }
    )

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo regenerar la factura'
  }
}

function RegenerateInvoiceForm() {
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const fail = await regenerateInvoice(data)
    setIsSubmitting(false)

    if (fail) return toast.error(fail)

    form.reset()
    toast.success('Se ha regenerado la factura')
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
            name="payment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pago</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    type="number"
                    autoComplete="off"
                    placeholder="no. pago"
                    {...field}
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
            <p>{isSubmitting ? 'Procesando...' : 'Regenerar factura'}</p>
            <span className="opacity-85 hidden lg:block">
              {isSubmitting ? '' : '(Ctrl + Enter)'}
            </span>
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default RegenerateInvoiceForm
