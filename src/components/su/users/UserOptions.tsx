import { API_URL } from 'astro:env/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Settings } from 'lucide-react'
import type { User } from '@/lib/types'
import { useCallback, useRef, useState } from 'react'
import { BadResponseError } from '@/lib/errors'
import { toast } from 'sonner'
import SendNotificationForm from './SendEmailForm'

async function expireSession(id: string): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/sessions/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo expirar la sesión'
  }
}

async function deactivateUser(id: string): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo desactivar el usuario'
  }
}

interface Props {
  id: string
  active: User['active']
}

function UserOptions({ id, active }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const sendRef = useRef<HTMLButtonElement>(null)

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleTriggerTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
  }

  const expire = useCallback(async () => {
    const loading = toast.loading('Esperando confirmación...')
    const fail = await expireSession(id)
    toast.dismiss(loading)
    if (fail) return toast.error(fail)

    toast.success('Sesión expirada')
  }, [id])

  const deactive = async () => {
    toast('Estas seguro que deseas desactivar este usuario?', {
      dismissible: true,
      duration: 5000,
      action: {
        label: 'Si',
        onClick: async () => {
          const loading = toast.loading('Esperando confirmación...')
          const res = await deactivateUser(id)
          toast.dismiss(loading)

          if (res) {
            toast.error(res)
            return
          }

          toast.success('Usuario desactivado')
          window.location.href = document.referrer || '/su/users'
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

  if (!active) return null

  return (
    <>
      <SendNotificationForm id={id} ref={sendRef} />
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
            <DropdownMenuItem asChild>
              <a href={`/su/new-service?user_id=${id}`}>Agregar servicio</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button
                className="w-full"
                onClick={() => sendRef.current?.click()}
              >
                Enviar correo
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button className="w-full" onClick={expire}>
                Expirar sesión
              </button>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <button className="w-full text-left" onClick={deactive}>
              Desactivar
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default UserOptions
