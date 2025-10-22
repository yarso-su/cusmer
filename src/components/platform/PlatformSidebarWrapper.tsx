import { Toaster } from 'sonner'
import LoadUserState from '../shared/LoadUserState'
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar'
import PlatformSidebar from './PlatformSidebar'

interface Props {
  children: React.ReactNode
}

function PlatformSidebarWrapper({ children }: Props) {
  return (
    <SidebarProvider defaultOpen={false}>
      <Toaster richColors position="bottom-center" closeButton />
      <LoadUserState />
      <PlatformSidebar />
      <main className="w-full h-dvh grid grid-rows-[auto_1fr] max-h-full overflow-hidden">
        <div className="mx-auto lg:mx-0 w-[90%] lg:px-2 py-2 lg:w-full flex justify-between items-center">
          <SidebarTrigger size="lg" />
          <div className="pr-2 flex gap-2">
            <p className="font-ubuntu inline-flex items-center gap-1 text-sm">
              Works
              <span className="font-normal text-xs text-contrast">v1.0.1</span>
            </p>
          </div>
        </div>
        {children}
      </main>
    </SidebarProvider>
  )
}

export default PlatformSidebarWrapper
