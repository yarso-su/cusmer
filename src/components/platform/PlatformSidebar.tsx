import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import SidebarProfile from '../shared/SidebarProfile'
import {
  Boxes,
  CircleHelp,
  CreditCard,
  FolderPlus,
  MessageSquareCode,
  Zap,
  BanknoteArrowUp,
  CirclePlus,
  House,
  Lock
} from 'lucide-react'
import { THREAD_TYPES_KEYS } from '@/lib/constants'

const threads_attachments = [
  {
    name: 'Consulta rápida',
    url: `/platform/new-thread?type=${THREAD_TYPES_KEYS.QUICK_HELP}`,
    icon: Zap
  },
  {
    name: 'Nueva iniciativa',
    url: `/platform/new-thread?type=${THREAD_TYPES_KEYS.NEW_INITIATIVE}`,
    icon: FolderPlus
  },
  {
    name: 'Detalle con Pagos / Facturación',
    url: `/platform/new-thread?type=${THREAD_TYPES_KEYS.PAYMENT_AND_INVOICE}`,
    icon: BanknoteArrowUp
  },
  {
    name: 'Soporte técnico',
    url: `/platform/new-thread?type=${THREAD_TYPES_KEYS.TECHNICAL_SUPPORT}`,
    icon: CircleHelp
  },
  {
    name: 'Crear hilo personalizado',
    url: `/platform/new-thread`,
    icon: CirclePlus
  }
]

const libraries = [
  {
    name: 'Servicios',
    url: '/platform/services',
    icon: Boxes
  },
  {
    name: 'Hilos',
    url: '/platform/threads',
    icon: MessageSquareCode
  },
  {
    name: 'Pagos',
    url: '/platform/payments',
    icon: CreditCard
  },
  {
    name: 'Credenciales',
    url: '/platform/secrets',
    icon: Lock
  }
]

function PlatformSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/platform">
                <House />
                <span>Dashboard</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Atajos (Hilos)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {threads_attachments.map(attachment => (
                <SidebarMenuItem key={attachment.name}>
                  <SidebarMenuButton asChild>
                    <a href={attachment.url}>
                      <attachment.icon />
                      <span>{attachment.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Bibliotecas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {libraries.map(library => (
                <SidebarMenuItem key={library.name}>
                  <SidebarMenuButton asChild>
                    <a href={library.url}>
                      <library.icon />
                      <span>{library.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarProfile />
    </Sidebar>
  )
}

export default PlatformSidebar
