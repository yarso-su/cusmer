import { Button } from '@/components/ui/button'
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
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { BadResponseError } from '@/lib/errors'
import { API_URL } from 'astro:env/client'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Input } from '../ui/input'
import {
  COMMON_ERRORS,
  CryptoError,
  importPublicKey,
  safeEncryptSecret
} from '@/lib/crypto'

const saveComplement = async (data: any) => {
  try {
    const res = await fetch(`${API_URL}/users/contract-complement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message

    return 'No se pudo cargar la clave de encriptación'
  }
}

const fetchAdminKey = async (): Promise<
  { success: true; key: string } | { success: false; error: string }
> => {
  try {
    const res = await fetch(`${API_URL}/users/admin-key`, {
      method: 'GET',
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)

    const body = await res.json()
    return {
      success: true,
      key: body.key
    }
  } catch (err) {
    if (err instanceof BadResponseError)
      return { success: false, error: err.message }

    return {
      success: false,
      error: 'No se pudo cargar la clave de encriptación'
    }
  }
}

const formSchema = z.object({
  legal_name: z
    .string()
    .min(4, {
      message: 'La razón social debe tener al menos 4 caracteres.'
    })
    .max(120, {
      message: 'La razón social no puede tener más de 120 caracteres'
    })
    .trim(),
  rfc: z
    .string()
    .min(12, { message: 'El RFC debe tener al menos 12 caracteres' })
    .max(13, {
      message: 'El RFC no puede tener más de 13 caracteres'
    })
    .trim(),
  fullname: z
    .string()
    .min(4, { message: 'El nombre debe tener al menos 4 caracteres' })
    .max(120, {
      message: 'El nombre no puede tener más de 120 caracteres'
    })
    .trim(),
  address: z
    .string()
    .min(10, { message: 'La dirección debe tener al menos 10 caracteres' })
    .max(240, {
      message: 'La descripción no puede tener más de 240 caracteres'
    })
    .trim(),
  role: z
    .string()
    .min(4, { message: 'El rol debe tener al menos 4 caracteres' })
    .max(60, { message: 'El rol no puede tener más de 60 caracteres' })
    .trim()
})

interface Props {
  onSuccess: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

function SaveComplementForm({ onSuccess, triggerRef }: Props) {
  const [key, setKey] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const dialogCloseRef = useRef<HTMLButtonElement>(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      legal_name: '',
      rfc: '',
      fullname: '',
      address: '',
      role: ''
    }
  })

  const handleOpen = useCallback(async (e: boolean) => {
    if (e !== true) return

    const loading = toast.loading('Cargando complemento...')
    const res = await fetchAdminKey()
    toast.dismiss(loading)

    if (!res.success) {
      toast.error(res.error)
      dialogCloseRef.current?.click()
      return
    }

    setKey(res.key)
  }, [])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!key) return toast.error('No se ha cargado la clave de encriptación')

    setIsSubmitting(true)

    try {
      const publicKey = await importPublicKey(key)
      const values = await Promise.all(
        Object.keys(data).map(async el => {
          const entry = data[el as keyof typeof data]
          return {
            key: el,
            value: await safeEncryptSecret(entry, publicKey)
          }
        })
      )

      const secrets = Object.fromEntries(
        values.map(item => [item.key, item.value])
      )

      const fail = await saveComplement(secrets)
      setIsSubmitting(false)

      if (fail) {
        return toast.error(fail)
      }

      toast.success('Complemento cargado')
      toast.info('¡Atención!', {
        duration: 5000,
        description:
          'Estos datos aparecerán tal como están en la versión final de tus contratos. Puedes borrarlos y volver a cargarlos en cualquier momento.'
      })
      onSuccess()
      form.reset()
    } catch (err) {
      setIsSubmitting(false)

      if (err instanceof CryptoError) {
        toast.error(COMMON_ERRORS[err.code] ?? 'Error al cargar el complemento')
        return
      }

      toast.error('Error al cargar el complemento')
    }
  }

  return (
    <Dialog onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          ref={triggerRef}
          className="w-full lg:w-fit lg:px-12"
        >
          Cargar complemento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Complemento para contratos</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 lg:gap-2 my-6">
              <FormField
                control={form.control}
                name="legal_name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Razón social</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Razón social de la empresa o nombre de la persona física"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rfc"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>RFC</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="RFC de la empresa o de la persona física"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre completo del firmante"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Dirección de la empresa o de la persona física"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rol dentro de la empresa/negocio"
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
                {isSubmitting ? 'Procesando...' : 'Cargar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default SaveComplementForm
