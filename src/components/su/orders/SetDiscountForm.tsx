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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

async function setDiscount(
  id: number,
  data: z.infer<typeof formSchema>
): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/orders/${id}/discount`, {
      method: 'PUT',
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
  description: z
    .string()
    .min(12, {
      message: 'El contenido debe tener al menos 12 caracteres.'
    })
    .max(240, { message: 'El contenido no puede tener más de 240 caracteres' }),
  percentage: z.preprocess(
    value => Number(value),
    z
      .number()
      .min(1, {
        message: 'El porcentaje debe ser mayor o igual a 1'
      })
      .max(100, {
        message: 'El porcentaje no puede ser mayor a 100'
      })
  ),
  disposable: z.boolean()
})

interface Props {
  id: number
  ref: React.RefObject<HTMLButtonElement | null>
}

function SetDiscountForm({ id, ref }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dialogCloseRef = useRef<HTMLButtonElement>(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      percentage: '',
      disposable: false
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const fail = await setDiscount(id, data)
    setIsSubmitting(false)

    if (fail) {
      toast.error(fail)
      return
    }

    dialogCloseRef.current?.click()
    form.reset(data)

    const event = new CustomEvent('discount-updated', {
      detail: {
        percentage: data.percentage,
        description: data.description
      }
    })

    document.dispatchEvent(event)
    toast.success('Se ha asignado el descuento')
  }

  const onError = (errors: any) => {
    console.log('Form validation errors:', errors)
    toast.error('Por favor corrige los errores en el formulario')
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
          <form onSubmit={form.handleSubmit(onSubmit, onError)}>
            <DialogHeader>
              <DialogTitle>Asignar descuento</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 my-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Descuento por "Cliente Recurrente"'
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="percentage"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Porcentaje</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1 - 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="disposable"
                render={({ field }) => (
                  <FormItem className="inline-flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Desechable</FormLabel>
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
                {isSubmitting ? 'Procesando...' : 'Asignar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default SetDiscountForm
