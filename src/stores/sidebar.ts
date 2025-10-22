import { atom } from 'nanostores'

export const sidebarOpen = atom(false)

export const toggleSidebar = () => {
  sidebarOpen.set(!sidebarOpen.get())
}

export const openSidebar = () => sidebarOpen.set(true)
export const closeSidebar = () => sidebarOpen.set(false)
