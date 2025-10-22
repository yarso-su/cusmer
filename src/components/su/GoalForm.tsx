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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { Textarea } from '../ui/textarea'

const formSchema = z.object({
  description: z
    .string()
    .min(10, {
      message: 'La descripción debe tener al menos 10 caracteres.'
    })
    .max(140, {
      message: 'La descripción no puede tener más de 140 caracteres'
    })
    .trim(),
  type: z.enum(['feature', 'technology', 'technical_restriction'], {
    message: 'Tipo inválido'
  })
})

interface Props {
  save: (data: z.infer<typeof formSchema>) => void
  update: (data: z.infer<typeof formSchema>, index: number) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  action: 'add' | 'update'
  goalToUpdate: {
    content: z.infer<typeof formSchema>
    index: number
  } | null
}

function GoalForm({ save, update, triggerRef, action, goalToUpdate }: Props) {
  const dialogCloseRef = useRef<HTMLButtonElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      type: 'feature'
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (action === 'add') {
      save(data)
      toast.success('Agregado')
    } else {
      if (!goalToUpdate) return
      update(data, goalToUpdate.index)
    }

    form.reset({
      description: '',
      type: 'feature'
    })
    dialogCloseRef.current?.click()
  }

  useEffect(() => {
    if (goalToUpdate) {
      form.reset(goalToUpdate.content)
    }
  }, [goalToUpdate])

  return (
    <Dialog
      onOpenChange={e => {
        if (!e)
          form.reset({
            description: '',
            type: 'feature'
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
                {action === 'add' ? 'Agregar' : 'Actualizar'} objetivo
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 lg:gap-2 my-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        className="resize-none"
                        placeholder="Registrar operaciones de..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Tipos</SelectLabel>
                            <SelectItem value="feature">
                              Funcionalidad
                            </SelectItem>
                            <SelectItem value="technology">
                              Tecnología
                            </SelectItem>
                            <SelectItem value="technical_restriction">
                              Restricción técnica
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
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

export default GoalForm
