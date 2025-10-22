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
import { Textarea } from '../ui/textarea'
import { Input } from '../ui/input'

const formSchema = z.object({
  label: z
    .string()
    .min(10, {
      message: 'La  etiqueta debe tener al menos 10 caracteres.'
    })
    .max(60, { message: 'La etiqueta no puede tener más de 60 caracteres' })
    .trim(),
  description: z
    .string()
    .min(10, {
      message: 'La descripción debe tener al menos 10 caracteres.'
    })
    .max(140, {
      message: 'La descripción no puede tener más de 140 caracteres'
    })
    .trim(),
  method: z
    .string()
    .min(10, {
      message: 'El medio de entrega debe tener al menos 10 caracteres.'
    })
    .max(60, {
      message: 'El medio de entrega no puede tener más de 60 caracteres'
    })
    .trim(),
  acceptance: z
    .string()
    .min(10, {
      message: 'El criterio de aceptación debe tener al menos 10 caracteres.'
    })
    .max(220, {
      message: 'El criterio de aceptación no puede tener más de 220 caracteres'
    })
    .trim()
})

interface Props {
  save: (data: z.infer<typeof formSchema>) => void
  update: (data: z.infer<typeof formSchema>, index: number) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  action: 'add' | 'update'
  deliverableToUpdate: {
    content: z.infer<typeof formSchema>
    index: number
  } | null
}

function DeliverableForm({
  save,
  update,
  triggerRef,
  action,
  deliverableToUpdate
}: Props) {
  const dialogCloseRef = useRef<HTMLButtonElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      description: '',
      method: '',
      acceptance: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (action === 'add') {
      save(data)
      toast.success('Agregado')
    } else {
      if (!deliverableToUpdate) return
      update(data, deliverableToUpdate.index)
    }

    form.reset({
      description: '',
      method: '',
      acceptance: '',
      label: ''
    })
    dialogCloseRef.current?.click()
  }

  useEffect(() => {
    if (deliverableToUpdate) {
      form.reset(deliverableToUpdate.content)
    }
  }, [deliverableToUpdate])

  return (
    <Dialog
      onOpenChange={e => {
        if (!e)
          form.reset({
            label: '',
            description: '',
            method: '',
            acceptance: ''
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
                {action === 'add' ? 'Agregar' : 'Actualizar'} entregable
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
                      <Input placeholder="SPA Web Frontend" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Medio de entrega</FormLabel>
                    <FormControl>
                      <Input placeholder="Deploy en AWS" {...field} />
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
                        className="resize-none"
                        placeholder="Interfaz para monitoreo y carga..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="acceptance"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Criterio de aceptación</FormLabel>
                    <FormControl>
                      <Textarea
                        className="resize-none"
                        placeholder="Validación visual por cliente..."
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

export default DeliverableForm
