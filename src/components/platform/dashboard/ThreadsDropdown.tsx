import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu'
import { THREAD_TYPES_KEYS } from '@/lib/constants'
import { EllipsisVertical } from 'lucide-react'
import { useState } from 'react'

function ThreadsDropdown() {
  const [isOpen, setIsOpen] = useState(false)

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleTriggerTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
  }

  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger asChild>
        <button
          onClick={handleTriggerClick}
          onTouchStart={handleTriggerTouchStart}
          className="p-1 flex justify-center items-center focus:outline-none hover:opacity-80 transition-opacity duration-200"
        >
          <EllipsisVertical className="size-4 text-contrast" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuItem>
          <a className="w-full" href="/platform/threads">
            Ver todos
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Crear</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <a
              className="w-full"
              href={`/platform/new-thread?type=${THREAD_TYPES_KEYS.QUICK_HELP}`}
            >
              Consulta rápida
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <a
              className="w-full"
              href={`/platform/new-thread?type=${THREAD_TYPES_KEYS.TECHNICAL_SUPPORT}`}
            >
              Soporte técnico
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <a
              className="w-full"
              href={`/platform/new-thread?type=${THREAD_TYPES_KEYS.NEW_INITIATIVE}`}
            >
              Nueva iniciativa
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <a
              className="w-full"
              href={`/platform/new-thread?type=${THREAD_TYPES_KEYS.PAYMENT_AND_INVOICE}`}
            >
              Pagos y Facturación
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <a className="w-full" href="/platform/new-thread">
              Personalizado
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThreadsDropdown
