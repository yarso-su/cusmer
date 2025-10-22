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
  CircleFadingPlus,
  CreditCard,
  HandCoins,
  HeartPulse,
  House,
  MessageSquareCode,
  PackagePlus,
  User
} from 'lucide-react'

const actions = [
  {
    name: 'Crear nuevo servicio',
    url: '/su/new-service',
    icon: PackagePlus
  },
  {
    name: 'Invitar a un usuario',
    url: '/su/invite-user',
    icon: CircleFadingPlus
  }
]

const libraries = [
  {
    name: 'Servicios',
    url: '/su/services',
    icon: Boxes
  },
  {
    name: 'Hilos',
    url: '/su/threads',
    icon: MessageSquareCode
  },
  {
    name: 'Pagos',
    url: '/su/payments',
    icon: CreditCard
  },
  {
    name: 'Usuarios',
    url: '/su/users',
    icon: User
  }
]

const system = [
  {
    name: 'Costos operativos',
    url: '/su/operating-costs',
    icon: HandCoins
  },
  {
    name: 'Logs',
    url: '/su/logs',
    icon: HeartPulse
  }
]

function SuSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/su">
                <House />
                <span>Dashboard</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Acciones</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {actions.map(action => (
                <SidebarMenuItem key={action.name}>
                  <SidebarMenuButton asChild>
                    <a href={action.url}>
                      <action.icon />
                      <span>{action.name}</span>
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
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {system.map(el => (
                <SidebarMenuItem key={el.name}>
                  <SidebarMenuButton asChild>
                    <a href={el.url}>
                      <el.icon />
                      <span>{el.name}</span>
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

export default SuSidebar
