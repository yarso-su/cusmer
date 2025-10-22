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
import { useEffect, useRef } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Input } from '../ui/input'

const formSchema = z.object({
  label: z
    .string()
    .min(10, {
      message: 'La  etiqueta debe tener al menos 10 caracteres'
    })
    .max(60, { message: 'La etiqueta no puede tener más de 60 caracteres' })
    .trim(),
  unit: z
    .string()
    .min(2, {
      message: 'La unidad debe tener al menos 2 caracteres'
    })
    .max(60, {
      message: 'La unidad no puede tener más de 60 caracteres'
    })
    .trim(),
  amount: z.preprocess(
    val => Number(val),
    z
      .number()
      .int({ message: 'La cantidad debe ser un número entero' })
      .min(1, { message: 'La cantidad debe ser mayor a cero' })
      .max(9999999, { message: 'La cantidad no puede ser mayor a 9999999' })
  )
})

interface Props {
  save: (data: z.infer<typeof formSchema>) => void
  update: (data: z.infer<typeof formSchema>, index: number) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  action: 'add' | 'update'
  toUpdate: {
    content: z.infer<typeof formSchema>
    index: number
  } | null
}

function UsageLimitForm({ save, update, triggerRef, action, toUpdate }: Props) {
  const dialogCloseRef = useRef<HTMLButtonElement>(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      unit: '',
      amount: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (action === 'add') {
      save(data)
      toast.success('Agregado')
    } else {
      if (!toUpdate) return
      update(data, toUpdate.index)
    }

    form.reset({
      label: '',
      unit: '',
      amount: ''
    })
    dialogCloseRef.current?.click()
  }

  useEffect(() => {
    if (toUpdate) {
      form.reset(toUpdate.content)
    }
  }, [toUpdate])

  return (
    <Dialog
      onOpenChange={e => {
        if (!e)
          form.reset({
            label: '',
            unit: '',
            amount: ''
          })
      }}
    >
      <DialogTrigger asChild>
        <button ref={triggerRef} className="hidden">
          <p>Ejecutar</p>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {action === 'add' ? 'Agregar' : 'Actualizar'} límite de uso
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 lg:gap-2 my-6">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Etiqueta</FormLabel>
                    <FormControl>
                      <Input placeholder="Fly.io volumen" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Unidad</FormLabel>
                    <FormControl>
                      <Input placeholder="GB" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="10"
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
              <Button type="submit">
                {action === 'add' ? 'Agregar' : 'Actualizar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default UsageLimitForm
