import { API_URL } from 'astro:env/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Settings } from 'lucide-react'
import { BadResponseError } from '@/lib/errors'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

async function unlink(id: number): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/threads/${id}/order`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo eliminar la relación'
  }
}

interface Props {
  id: number
  orderId?: number
}

function ThreadOptions({ id, orderId }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleTriggerTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
  }

  const handleUnlink = useCallback(async () => {
    toast.info('Procesando...')
    const fail = await unlink(id)
    if (fail) return toast.error(fail)

    toast.success('Relación eliminada')
    window.location.href = `/platform/threads/${id}`
  }, [id])

  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger asChild className="flex items-center">
        <button
          onClick={handleTriggerClick}
          onTouchStart={handleTriggerTouchStart}
        >
          <Settings className="size-4 opacity-100 hover:opacity-60 transition-opacity duration-200" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {orderId !== undefined ? (
          <>
            <DropdownMenuLabel>Servicio ({orderId})</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <a className="w-full" href={`/platform/services/${orderId}`}>
                  Inspeccionar
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button className="w-full text-left" onClick={handleUnlink}>
                  Desvincular
                </button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <a className="w-full" href={`/platform/link-thread?id=${id}`}>
                  Vincular a servicio
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThreadOptions
