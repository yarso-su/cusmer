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
import { useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { BadResponseError } from '@/lib/errors'
import { Input } from '../ui/input'
import ItemTypeSelect from '../shared/ItemTypeSelect'
import { Textarea } from '../ui/textarea'

async function updateItem(
  id: number,
  { type, cost, ...rest }: z.infer<typeof formSchema>
): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/orders/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...rest,
        type: Number(type),
        cost: Number(cost)
      })
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo editar el item'
  }
}

const formSchema = z.object({
  name: z
    .string()
    .min(6, {
      message: 'El nombre debe tener al menos 6 caracteres.'
    })
    .max(60, { message: 'El nombre no puede tener más de 60 caracteres' })
    .trim(),
  description: z
    .string()
    .min(12, { message: 'La descripción debe tener al menos 12 caracteres' })
    .max(240, {
      message: 'La descripción no puede tener más de 240 caracteres'
    })
    .trim(),
  type: z
    .string()
    .min(1, { message: 'Selecciona un tipo' })
    .refine(
      val => {
        const n = Number(val)
        return !isNaN(n) && n > 0 && n < 29
      },
      {
        message: 'Tipo de item inválido'
      }
    ),
  cost: z
    .string()
    .min(1, { message: 'Ingresa un costo' })
    .refine(
      val => {
        const n = Number(val)
        return !isNaN(n) && n >= 50 && n <= 99999 && Number.isInteger(n)
      },
      { message: 'El costo debe ser un número entre 50 - 99999' }
    )
})

interface Props {
  triggerRef: React.RefObject<HTMLButtonElement | null>
  onItemEdited: (item: {
    id: number
    name: string
    description: string
    type: number
    cost: number
  }) => void
  editingItem: {
    id: number
    name: string
    description: string
    type: number
    cost: number
  } | null
}

function UpdateItemForm({ triggerRef, editingItem, onItemEdited }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dialogCloseRef = useRef<HTMLButtonElement>(null)

  const defaultValues = useMemo(
    () => ({
      name: editingItem?.name ?? '',
      description: editingItem?.description ?? '',
      type: editingItem?.type.toString() ?? '',
      cost: editingItem?.cost.toString() ?? ''
    }),
    [editingItem]
  )

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!editingItem) return

    setIsSubmitting(true)

    const fail = await updateItem(editingItem.id, data)
    setIsSubmitting(false)

    if (fail) {
      toast.error(fail)
      return
    }

    onItemEdited({
      id: editingItem.id,
      name: data.name,
      description: data.description,
      type: Number(data.type),
      cost: Number(data.cost)
    })

    dialogCloseRef.current?.click()
    form.reset()

    toast.success('Se ha editado el item')
  }

  const onError = (errors: any) => {
    console.log('Form validation errors:', errors)
    toast.error('Por favor corrige los errores en el formulario')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button ref={triggerRef} className="hidden">
          Editar
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)}>
            <DialogHeader>
              <DialogTitle>Editar articulo</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 lg:gap-2 my-6">
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
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Instancias de AWS EC2 para despliegue de un backend"
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <ItemTypeSelect
                        className="w-full"
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Costo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1500"
                        min="50"
                        max="99999"
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
                {isSubmitting ? 'Procesando...' : 'Editar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateItemForm
