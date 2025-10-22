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
import ItemTypeSelect from '../shared/ItemTypeSelect'
import { Plus } from 'lucide-react'
import { Textarea } from '../ui/textarea'

async function addItem(
  id: number,
  { type, cost, ...rest }: z.infer<typeof formSchema>
): Promise<{ success: true; id: number } | { success: false; error: string }> {
  try {
    const res = await fetch(`${API_URL}/orders/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...rest,
        type: Number(type),
        cost: Number(cost),
        service_id: id
      })
    })

    if (!res.ok) throw new BadResponseError(res)

    const content = await res.json()
    return { success: true, id: content.itemId }
  } catch (err) {
    if (err instanceof BadResponseError) {
      return { success: false, error: err.message }
    }

    return { success: false, error: 'No se pudo agregar el item' }
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
  onItemAdded: (item: {
    id: number
    name: string
    description: string
    type: number
    cost: number
  }) => void
  id: number
}

function AddItemForm({ onItemAdded, id }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dialogCloseRef = useRef<HTMLButtonElement>(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      type: '',
      cost: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const res = await addItem(id, data)
    setIsSubmitting(false)

    if (!res.success) {
      toast.error(res.error)
      return
    }

    onItemAdded({
      id: res.id,
      name: data.name,
      description: data.description,
      type: Number(data.type),
      cost: Number(data.cost)
    })

    dialogCloseRef.current?.click()
    form.reset()

    toast.success('Se ha agregado el item')
  }

  const onError = (errors: any) => {
    console.log('Form validation errors:', errors)
    toast.error('Por favor corrige los errores en el formulario')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex gap-1 items-center opacity-85 text-sm hover:opacity-60 transition-opacity duration-200">
          <Plus className="size-4 text-contrast" />
          <p>Agregar</p>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)}>
            <DialogHeader>
              <DialogTitle>Agregar articulo</DialogTitle>
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
                        min="50"
                        max="99999"
                        step="1"
                        placeholder="1500"
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

export default AddItemForm
