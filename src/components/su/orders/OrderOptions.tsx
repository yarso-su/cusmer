import { API_URL } from 'astro:env/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Settings } from 'lucide-react'
import UpdateOrderForm from '../UpdateOrderForm'
import type { Order } from '@/lib/types'
import { useCallback, useRef, useState } from 'react'
import SetDiscountForm from './SetDiscountForm'
import { BadResponseError } from '@/lib/errors'
import { toast } from 'sonner'
import UpdateStatusForm from './UpdateStatusForm'

async function generateLoggerToken(
  id: number
): Promise<
  { success: true; token: string } | { success: false; message: string }
> {
  try {
    const res = await fetch(`${API_URL}/orders/${id}/logger-token`, {
      method: 'POST',
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)

    const body = await res.json()
    return { success: true, token: body.token }
  } catch (err) {
    if (err instanceof BadResponseError)
      return { success: false, message: err.message }
    return { success: false, message: 'No se pudo generar el token' }
  }
}

async function dropLoggerToken(id: number): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/orders/${id}/logger-token`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo eliminar el token'
  }
}

async function deleteDiscount(id: number): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/orders/${id}/discount`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo eliminar el descuento'
  }
}

interface Props {
  id: number
  data: Omit<Order, 'items' | 'user' | 'id' | 'discount'>
}

function OrderOptions({ id, data }: Props) {
  const { status, ...current } = data
  const [isOpen, setIsOpen] = useState(false)
  const updateRef = useRef<HTMLButtonElement>(null)
  const discountRef = useRef<HTMLButtonElement>(null)
  const statusRef = useRef<HTMLButtonElement>(null)

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleTriggerTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
  }

  const dropToken = useCallback(async () => {
    const loading = toast.loading('Esperando confirmación...')
    const fail = await dropLoggerToken(id)
    toast.dismiss(loading)
    if (fail) return toast.error(fail)

    toast.success('Token eliminado')
  }, [])

  const generateToken = useCallback(async () => {
    const loading = toast.loading('Esperando confirmación...')
    const res = await generateLoggerToken(id)
    toast.dismiss(loading)
    if (!res.success) return toast.error(res.message)

    toast.success('Token generado', {
      duration: 10000,
      dismissible: true,
      description: res.token,
      action: {
        label: 'Copiar',
        onClick: () => {
          navigator.clipboard.writeText(res.token)
        }
      },
      actionButtonStyle: {
        backgroundColor: 'oklch(52.7% 0.154 150.069)'
      }
    })
  }, [])

  const deleteDiscountHandler = async () => {
    toast('Estas seguro que deseas eliminar el descuento?', {
      dismissible: true,
      duration: 5000,
      action: {
        label: 'Si',
        onClick: async () => {
          const res = await deleteDiscount(id)

          if (res) {
            toast.error(res)
            return
          }

          toast.success('Descuento eliminado')
          const event = new CustomEvent('discount-updated', {
            detail: undefined
          })

          document.dispatchEvent(event)
        }
      },
      cancel: {
        label: 'No',
        onClick: () => {
          toast.dismiss()
          return
        }
      }
    })
  }

  return (
    <>
      <UpdateOrderForm id={id} current={current} ref={updateRef} />
      <SetDiscountForm id={id} ref={discountRef} />
      <UpdateStatusForm id={id} ref={statusRef} />
      <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
        <DropdownMenuTrigger asChild>
          <button
            onClick={handleTriggerClick}
            onTouchStart={handleTriggerTouchStart}
            className="opacity-85 text-sm hover:opacity-60 transition-opacity duration-200 inline-flex items-center gap-1"
          >
            <Settings className="size-4 text-contrast" />
            <p>Ajustes</p>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <button
                className="w-full text-left"
                onClick={() => updateRef.current?.click()}
              >
                Actualizar
              </button>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Descuento</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>
                    <button
                      className="w-full text-left"
                      onClick={() => discountRef.current?.click()}
                    >
                      Modificar
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button
                      className="w-full text-left"
                      onClick={deleteDiscountHandler}
                    >
                      Eliminar
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <button
              className="w-full text-left"
              onClick={() => statusRef.current?.click()}
            >
              Cambiar estado
            </button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <button className="w-full" onClick={generateToken}>
              Generar logger token
            </button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <button className="w-full" onClick={dropToken}>
              Limpiar token
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default OrderOptions
