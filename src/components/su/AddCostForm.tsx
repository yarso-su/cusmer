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
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { BadResponseError } from '@/lib/errors'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

async function addCost(
  data: z.infer<typeof formSchema>
): Promise<
  { success: true; id: number } | { success: false; message: string }
> {
  try {
    const res = await fetch(`${API_URL}/internal/operating-costs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new BadResponseError(res)

    const body = await res.json()
    return { success: true, id: body.id }
  } catch (err) {
    if (err instanceof BadResponseError) {
      return { success: false, message: err.message }
    }

    return { success: false, message: 'No se pudo agregar el item' }
  }
}

const formSchema = z.object({
  amount: z.preprocess(
    val => Number(val),
    z
      .number()
      .int({
        message: 'El importe debe ser un número entero'
      })
      .min(1, {
        message: 'El importe debe ser mayor a 1'
      })
      .max(10000, {
        message: 'El importe no puede ser mayor a 10000'
      })
  ),
  note: z
    .string()
    .min(4, { message: 'La nota debe tener al menos 4 caracteres' })
    .max(140, {
      message: 'La nota no puede tener más de 140 caracteres'
    })
    .trim()
})

interface Props {
  onCostAdded: (secret: { id: number; amount: string; note: string }) => void
}

function AddCostForm({ onCostAdded }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dialogCloseRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      note: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const res = await addCost(data)
    setIsSubmitting(false)

    if (!res.success) {
      toast.error(res.message)
      return
    }

    toast.success('Entrada registrada')

    onCostAdded({
      id: res.id,
      amount: String(data.amount),
      note: data.note
    })

    dialogCloseRef.current?.click()
    form.reset()
  }

  useEffect(() => {
    const showForm = () => {
      triggerRef.current?.click()
    }

    document.addEventListener('show-add-cost-form', showForm)

    return () => {
      document.removeEventListener('show-add-cost-form', showForm)
    }
  }, [])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button ref={triggerRef} className="hidden">
          Agregar
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Agregar costo</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 lg:gap-2 my-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="189"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nota</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contenido relevante"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
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
                {isSubmitting ? 'Procesando...' : 'Agregar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddCostForm
