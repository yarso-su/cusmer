import type { OperatingCost } from '@/lib/types'
import { Eraser } from 'lucide-react'
import { useState } from 'react'
import AddCostForm from './AddCostForm'
import { toast } from 'sonner'
import { API_URL } from 'astro:env/client'
import { BadResponseError } from '@/lib/errors'

async function dropCost(id: number): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/internal/operating-costs/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo eliminar el costo'
  }
}

interface Props {
  costs: Array<OperatingCost>
}

function OperatingCostsList({ costs: currentCosts }: Props) {
  const [costs, setCosts] = useState<Array<OperatingCost>>(currentCosts)

  const drop = async (id: number) => {
    const loading = toast.loading('Esperando confirmación...')
    const fail = await dropCost(id)
    toast.dismiss(loading)
    if (fail) return toast.error(fail)

    toast.success('Costo eliminado')
    setCosts(costs.filter(cost => cost.id !== id))
  }

  if (costs.length === 0)
    return (
      <>
        <div className="w-full h-full flex items-center justify-center">
          <p className="opacity-60 dark:opacity-40">
            No hay costos que mostrar
          </p>
        </div>
        <AddCostForm onCostAdded={cost => setCosts([...costs, cost])} />
      </>
    )

  return (
    <>
      <ul className="grid grid-cols-1 max-h-max overflow-y-auto">
        {costs.map(cost => (
          <li
            className="cborder-b grid grid-cols-[1fr_auto_auto] lg:grid-cols-[1fr_120px_auto] p-2"
            key={cost.id}
          >
            <p className="truncate">{cost.note}</p>
            <div className="px-2 cborder-l">
              ${Number(cost.amount).toLocaleString()} MXN
            </div>
            <button
              onClick={() => drop(cost.id)}
              aria-label="Eliminar costo"
              className="content-center transition-opacity duration-200 hover:opacity-80 cborder-l pl-2"
            >
              <Eraser className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <AddCostForm onCostAdded={cost => setCosts([...costs, cost])} />
    </>
  )
}

export default OperatingCostsList
