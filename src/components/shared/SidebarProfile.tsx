import { API_URL } from 'astro:env/client'
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '../ui/sidebar'
import { ChevronsUpDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import ToggleThemeNonStyled from './ToggleThemeNonStyled'
import { useStore } from '@nanostores/react'
import store from '@/stores/user'
import { ROLES } from '@/lib/constants'
import { BadResponseError } from '@/lib/errors'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

async function exportData(): Promise<
  { success: true; data: Blob } | { success: false; error: string }
> {
  try {
    const res = await fetch(`${API_URL}/export-db`, {
      method: 'GET',
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)

    const data = await res.blob()
    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'No se pudo exportar los datos' }
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

function SidebarProfile() {
  const user = useStore(store)
  const [isOpen, setIsOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleTriggerTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
  }
  const handleLogout = useCallback(async () => {
    const fail = await logout()
    if (fail) return toast.error(fail)

    window.localStorage.removeItem('user_name')
    window.localStorage.removeItem('user_email')
    window.localStorage.removeItem('user_role')
    window.location.replace('/')
  }, [])

  const handleExportData = useCallback(async () => {
    if (exporting) return

    setExporting(true)

    const loading = toast.loading('Exportando...')
    const res = await exportData()
    toast.dismiss(loading)

    if (!res.success) {
      setExporting(false)
      return toast.error(res.error)
    }

    try {
      const url = window.URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-${new Date().toISOString().split('T')[0]}.db`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Archivo descargado')
    } catch (err) {
      toast.error('No se pudo descargar el archivo')
    }

    setExporting(false)
  }, [exporting])

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                onClick={handleTriggerClick}
                onTouchStart={handleTriggerTouchStart}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-contrast cborder text-slate-200 font-semibold">
                  {user.name.charAt(0)}
                </div>
                <div
                  className="flex flex-col gap-0.5 leading-none"
                  suppressHydrationWarning
                >
                  <span className="font-semibold">{user.name}</span>
                  <span className="">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuGroup>
                {user.role === ROLES.CLIENT && (
                  <DropdownMenuItem asChild>
                    <a href="/platform/billing">Facturación</a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <ToggleThemeNonStyled className="w-full text-left p-0 m-0" />
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Legal</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <a href="/legal/terms/" target="_blank">
                    Términos y condiciones
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/legal/policies/" target="_blank">
                    Política de privacidad
                  </a>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {user.role === ROLES.CLIENT && (
                <>
                  <DropdownMenuItem asChild>
                    <a href="/platform/new-thread">Soporte técnico</a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {user.role === ROLES.ADMIN && (
                <>
                  <DropdownMenuLabel>Sistema</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <button onClick={handleExportData} className="w-full">
                      Exportar datos
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/su/regenerate-invoice">Regenerar factura</a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild>
                <a target="_blank" href="/">
                  Página de inicio
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <button className="w-full" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  )
}

export default SidebarProfile
