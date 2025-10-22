import { BadResponseError } from '@/lib/errors'
import { API_URL } from 'astro:env/client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Eraser } from 'lucide-react'
import { Button } from '../ui/button'

async function clear(limit: number): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/payments/clear-taxes?limit=${limit}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof Error) return err.message
    return 'No se pudo borrar los datos'
  }
}

type Data = { amount: number; last: number } | null
interface Props {
  data: Data
}

function Taxes({ data }: Props) {
  const [content, setContent] = useState<Data>(data)

  const handleClick = async () => {
    toast('Estas seguro que deseas limpiar los datos?', {
      dismissible: true,
      duration: 5000,
      action: {
        label: 'Si',
        onClick: async () => {
          if (content === null) return

          const loading = toast.loading('Eliminando...')

          const fail = await clear(content.last)
          toast.dismiss(loading)
          if (fail) return toast.error(fail)

          toast.success('Perfil de facturación eliminado')
          setContent(null)
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

  if (!content)
    return (
      <div className="flex justify-center items-center cborder">
        <p>
          No hay{' '}
          <span className="decoration-contrast underline underline-offset-2">
            impuestos
          </span>{' '}
          acumulados
        </p>
      </div>
    )

  return (
    <div className="grid grid-cols-[1fr_auto] gap-2">
      <div className="flex items-center justify-center cborder">
        <p className="inline-flex items-center gap-2">
          <span className="font-semibold">IVA:</span>
          <span className="decoration-contrast underline underline-offset-2">
            ${Number(content.amount).toLocaleString()} MXN
          </span>
        </p>
      </div>
      <Button
        aria-label="Borrar datos"
        onClick={handleClick}
        className="w-full h-full flex justify-center cborder bg-csecondary items-center hover:bg-accent text-accent-foreground dark:hover:bg-neutral-900 gap-2"
      >
        <Eraser className="size-4" />
      </Button>
    </div>
  )
}

export default Taxes
