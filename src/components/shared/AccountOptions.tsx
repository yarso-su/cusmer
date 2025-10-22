import { API_URL } from 'astro:env/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Settings } from 'lucide-react'
import { BadResponseError } from '@/lib/errors'
import { toast } from 'sonner'
import { useStore } from '@nanostores/react'
import store from '@/stores/user'
import { useCallback, useState } from 'react'
import { ROLES } from '@/lib/constants'

async function dropContractComplement(): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/users/contract-complement`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (error) {
    return 'No se pudo borrar el complemento'
  }
}

async function clearKey(): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/users/me/key`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (error) {
    return 'No se pudo borrar la clave de encriptación'
  }
}

async function logout(): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/sessions`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (error) {
    return 'No se pudo cerrar la sesión'
  }
}

async function sendRequest(email: string): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/users/send-reset-password-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo enviar el correo'
  }
}

interface Props {
  prefix: 'platform' | 'su'
}

function AccountOptions({ prefix }: Props) {
  const user = useStore(store)
  const [isOpen, setIsOpen] = useState(false)

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleTriggerTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
  }

  const handleClick = useCallback(async () => {
    const loading = toast.loading('Enviando...')

    const fail = await sendRequest(user.email)
    toast.dismiss(loading)
    if (fail) return toast.error(fail)

    toast.info(
      'Se ha enviado un correo con un enlace para actualizar tu contraseña'
    )
  }, [])

  const handleDropComplement = useCallback(async () => {
    const loading = toast.loading('Eliminando...')

    const fail = await dropContractComplement()
    toast.dismiss(loading)
    if (fail) return toast.error(fail)

    toast.info('Eliminado')
  }, [])

  const handleLogout = useCallback(async () => {
    const fail = await logout()
    if (fail) return toast.error(fail)

    window.localStorage.removeItem('user_name')
    window.localStorage.removeItem('user_email')
    window.localStorage.removeItem('user_role')
    window.location.replace('/')
  }, [])

  const handleClearKey = useCallback(async () => {
    toast.warning(
      'Esta acción eliminara las credenciales existentes. Estas seguro que deseas continuar?',
      {
        dismissible: true,
        duration: 5000,
        action: {
          label: 'Si',
          onClick: async () => {
            const loading = toast.loading('Procesando...')
            const res = await clearKey()
            toast.dismiss(loading)

            if (res) {
              toast.error(res)
              return
            }

            window.localStorage.removeItem('privateKey')
            toast.success('Clave eliminada')
          }
        },
        actionButtonStyle: {
          backgroundColor: 'oklch(76.9% 0.188 70.08)',
          color: 'white'
        }
      }
    )
  }, [])

  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger asChild>
        <button
          onClick={handleTriggerClick}
          onTouchStart={handleTriggerTouchStart}
          aria-label="Configuración de cuenta"
          className="px-4 py-4 w-full h-full flex justify-center cborder bg-csecondary items-center hover:bg-accent hover:text-accent-foreground dark:hover:bg-neutral-900 gap-2"
        >
          <Settings size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a href={`/${prefix}/profile/update-email`}>Actualizar correo</a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <button className="w-full" onClick={handleClick}>
              Actualizar contraseña
            </button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <button className="w-full" onClick={handleClearKey}>
              Borrar clave de encriptación
            </button>
          </DropdownMenuItem>
          {user.role === ROLES.CLIENT && (
            <DropdownMenuItem asChild>
              <button
                className="w-full text-left"
                onClick={handleDropComplement}
              >
                Eliminar complemento para contratos
              </button>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <button className="w-full" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AccountOptions
