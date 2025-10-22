import { API_URL } from 'astro:env/client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { BadResponseError } from '@/lib/errors'
import type { ContractData, OrderWithContract } from '@/lib/types'
import { Input } from '../ui/input'
import type { TDocumentDefinitions } from 'pdfmake/interfaces'
import { Edit, Eraser, Plus } from 'lucide-react'
import GoalForm from './GoalForm'
import { GOAL_TYPES, ORDER_STATUSES_KEYS } from '@/lib/constants'
import DeliverableForm from './DeliverableForm'
import UsageLimitForm from './UsageLimitForm'
import Contract from './Contract'
import { generateDefinition, getBlob } from '@/lib/pdfmake'

async function saveContent(
  id: number,
  data: ContractData
): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/orders/${id}/contract`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo actualizar el contrato'
  }
}

interface Props {
  id: number
  status: number
  contract: string | undefined
  order: Omit<OrderWithContract, 'status' | 'contract'>
}

function GenerateContractForm({
  id,
  status,
  order,
  contract: contractString
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewIsLoading, setPreviewIsLoading] = useState(false)

  const [contractObject, setContractObject] = useState('')
  const [goals, setGoals] = useState<ContractData['goals']>([])
  const [deliverables, setDeliverables] = useState<
    ContractData['deliverables']
  >([])
  const [usageLimits, setUsageLimits] = useState<ContractData['usageLimits']>(
    []
  )

  const [definition, setDefinition] = useState<TDocumentDefinitions | null>(
    null
  )

  const [goalAction, setGoalAction] = useState<'add' | 'update'>('add')
  const [goalToUpdate, setGoalToUpdate] = useState<{
    content: ContractData['goals'][0]
    index: number
  } | null>(null)

  const [deliverableAction, setDeliverableAction] = useState<'add' | 'update'>(
    'add'
  )
  const [deliverableToUpdate, setDeliverableToUpdate] = useState<{
    content: ContractData['deliverables'][0]
    index: number
  } | null>(null)

  const [usageLimitAction, setUsageLimitAction] = useState<'add' | 'update'>(
    'add'
  )
  const [usageLimitToUpdate, setUsageLimitToUpdate] = useState<{
    content: ContractData['usageLimits'][0]
    index: number
  } | null>(null)

  const goalRef = useRef<HTMLButtonElement | null>(null)
  const deliverableRef = useRef<HTMLButtonElement | null>(null)
  const usageLimitRef = useRef<HTMLButtonElement | null>(null)

  const handleSave = async () => {
    if (definition !== null) {
      return toast.error('No hay cambios pendientes')
    }
    setDefinition(null)

    if (
      goals.length === 0 ||
      deliverables.length === 0 ||
      typeof contractObject !== 'string' ||
      contractObject.length === 0
    ) {
      return toast.error(
        'Debes definir el objeto del contrato y agregar al menos una funcionalidad y un entregable'
      )
    }

    if (order.is_recurring && usageLimits.length === 0) {
      return toast.error(
        'Debes definir al menos un límite de uso para los servicios recurrentes'
      )
    }

    setIsSubmitting(true)

    const fail = await saveContent(id, {
      object: contractObject,
      goals,
      deliverables,
      usageLimits
    })
    setIsSubmitting(false)

    if (fail) return toast.error(fail)

    toast.success('Progreso actualizado')
    setDefinition(
      generateDefinition(
        {
          object: contractObject,
          goals,
          deliverables,
          usageLimits
        },
        order
      )
    )
  }

  const handleDownloadPreview = useCallback(async () => {
    if (previewIsLoading) {
      return
    }

    if (definition === null) {
      return toast.error(
        'Debes guardar los cambios antes de generar la vista previa'
      )
    }

    setPreviewIsLoading(true)

    const loading = toast.loading('Generando vista previa...')
    try {
      const blob = await getBlob(definition)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'contrato.pdf'
      a.click()
      URL.revokeObjectURL(url)

      toast.dismiss(loading)
      toast.success('Vista previa generada')
    } catch (err) {
      console.error(err)
      toast.dismiss(loading)
      toast.error('No se pudo generar la vista previa')
    }

    setPreviewIsLoading(false)
  }, [definition])

  useEffect(() => {
    try {
      if (typeof contractString !== 'string') return

      const contract = JSON.parse(contractString) as ContractData

      if (
        typeof contract.object !== 'string' ||
        contract.object.length === 0 ||
        !Array.isArray(contract.goals) ||
        !Array.isArray(contract.deliverables) ||
        !Array.isArray(contract.usageLimits)
      ) {
        throw new Error('Invalid contract object')
      }

      setContractObject(contract.object)
      setGoals(contract.goals)
      setDeliverables(contract.deliverables)
      setUsageLimits(contract.usageLimits)

      setDefinition(generateDefinition(contract, order))
      toast.info('Datos cargados correctamente')
    } catch (err) {
      console.error(err)
      toast.error('No fue posible cargar el contrato')
    }
  }, [])

  return (
    <div className="h-full grid grid-rows-[1fr_auto] gap-2">
      <div>
        <div>
          <label className="mb-2 flex items-center gap-2 lg:text-lg leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
            Objeto del contrato
          </label>
          <Input
            autoComplete="off"
            placeholder="ex. desarrollar e implementar un sistema web para..."
            onChange={e => {
              setContractObject(e.target.value)
              setDefinition(null)
            }}
            value={contractObject}
          />
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-end">
            <GoalForm
              goalToUpdate={goalToUpdate}
              triggerRef={goalRef}
              action={goalAction}
              save={data => {
                setDefinition(null)
                setGoals(goals => [...goals, data])
              }}
              update={(data, index) => {
                setDefinition(null)
                setGoals(goals => {
                  goals[index] = data
                  return [...goals]
                })
              }}
            />
            <p className="font-semibold lg:text-lg">Objetivos</p>
            <button
              onClick={() => {
                setGoalAction('add')
                goalRef.current?.click()
              }}
              className="inline-flex gap-1 items-center opacity-85 text-sm hover:opacity-60 transition-opacity duration-200"
            >
              <Plus className="size-4 text-contrast" />
              <p>Agregar</p>
            </button>
          </div>
          <ul className="bg-csecondary cborder rounded-sm mt-1 max-h-[200px] overflow-y-auto">
            {goals.length === 0 ? (
              <p className="p-2 text-center opacity-70">Aún no hay objetivos</p>
            ) : (
              goals.map((goal, index) => (
                <li
                  key={index}
                  className="cborder-b last:border-b-0 grid grid-cols-[1fr_auto_auto_auto] lg:grid-cols-[1fr_200px_auto_auto] p-2"
                >
                  <p className="truncate">{goal.description}</p>
                  <p className="cborder-l px-2 truncate">
                    {GOAL_TYPES[goal.type]}
                  </p>
                  <button
                    aria-label="Descargar comprobante"
                    onClick={() => {
                      setGoalAction('update')
                      setGoalToUpdate({ content: goal, index })
                      goalRef.current?.click()
                    }}
                    className="content-center transition-opacity duration-200 hover:opacity-80 cborder-l px-2"
                  >
                    <Edit className="size-4" />
                  </button>
                  <button
                    aria-label="Ver servicio relacionado"
                    onClick={() => {
                      setDefinition(null)
                      setGoals(goals => {
                        goals.splice(index, 1)
                        return [...goals]
                      })
                    }}
                    className="content-center transition-opacity duration-200 hover:opacity-80 cborder-l pl-2"
                  >
                    <Eraser className="size-4" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-end">
            <DeliverableForm
              deliverableToUpdate={deliverableToUpdate}
              triggerRef={deliverableRef}
              action={deliverableAction}
              save={data => {
                setDefinition(null)
                setDeliverables(deliverables => [...deliverables, data])
              }}
              update={(data, index) => {
                setDefinition(null)
                setDeliverables(deliverables => {
                  deliverables[index] = data
                  return [...deliverables]
                })
              }}
            />
            <p className="font-semibold lg:text-lg">Entregables</p>
            <button
              onClick={() => {
                setDeliverableAction('add')
                deliverableRef.current?.click()
              }}
              className="inline-flex gap-1 items-center opacity-85 text-sm hover:opacity-60 transition-opacity duration-200"
            >
              <Plus className="size-4 text-contrast" />
              <p>Agregar</p>
            </button>
          </div>
          <ul className="bg-csecondary cborder rounded-sm mt-1 max-h-[200px] overflow-y-auto">
            {deliverables.length === 0 ? (
              <p className="p-2 text-center opacity-70">
                Aún no hay entregables de uso
              </p>
            ) : (
              deliverables.map((deliverable, index) => (
                <li
                  key={index}
                  className="cborder-b last:border-b-0 grid grid-cols-[1fr_1fr_2fr_2fr_auto_auto] p-2"
                >
                  <p className="truncate">{deliverable.label}</p>
                  <p className="cborder-l px-2 truncate">
                    {deliverable.method}
                  </p>
                  <p className="cborder-l px-2 truncate">
                    {deliverable.description}
                  </p>
                  <p className="cborder-l px-2 truncate">
                    {deliverable.acceptance}
                  </p>
                  <button
                    aria-label="Descargar comprobante"
                    onClick={() => {
                      setDeliverableAction('update')
                      setDeliverableToUpdate({ content: deliverable, index })
                      deliverableRef.current?.click()
                    }}
                    className="content-center transition-opacity duration-200 hover:opacity-80 cborder-l px-2"
                  >
                    <Edit className="size-4" />
                  </button>
                  <button
                    aria-label="Ver servicio relacionado"
                    onClick={() => {
                      setDefinition(null)
                      setDeliverables(deliverables => {
                        deliverables.splice(index, 1)
                        return [...deliverables]
                      })
                    }}
                    className="content-center transition-opacity duration-200 hover:opacity-80 cborder-l pl-2"
                  >
                    <Eraser className="size-4" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-end">
            <UsageLimitForm
              toUpdate={usageLimitToUpdate}
              triggerRef={usageLimitRef}
              action={usageLimitAction}
              save={data => {
                setDefinition(null)
                setUsageLimits(usageLimits => [...usageLimits, data])
              }}
              update={(data, index) => {
                setDefinition(null)
                setUsageLimits(usageLimits => {
                  usageLimits[index] = data
                  return [...usageLimits]
                })
              }}
            />
            <p className="font-semibold lg:text-lg">Límites de uso</p>
            <button
              onClick={() => {
                setUsageLimitAction('add')
                usageLimitRef.current?.click()
              }}
              className="inline-flex gap-1 items-center opacity-85 text-sm hover:opacity-60 transition-opacity duration-200"
            >
              <Plus className="size-4 text-contrast" />
              <p>Agregar</p>
            </button>
          </div>
          <ul className="bg-csecondary cborder rounded-sm mt-1 max-h-[200px] overflow-y-auto">
            {usageLimits.length === 0 ? (
              <p className="p-2 text-center opacity-70">
                Aún no hay límites de uso
              </p>
            ) : (
              usageLimits.map((limit, index) => (
                <li
                  key={index}
                  className="cborder-b last:border-b-0 grid grid-cols-[2fr_2fr_1fr_auto_auto] p-2"
                >
                  <p className="truncate">{limit.label}</p>
                  <p className="cborder-l px-2 truncate">{limit.unit}</p>
                  <p className="cborder-l px-2 truncate">
                    {Number(limit.amount).toLocaleString()}
                  </p>
                  <button
                    aria-label="Descargar comprobante"
                    onClick={() => {
                      setUsageLimitAction('update')
                      setUsageLimitToUpdate({ content: limit, index })
                      usageLimitRef.current?.click()
                    }}
                    className="content-center transition-opacity duration-200 hover:opacity-80 cborder-l px-2"
                  >
                    <Edit className="size-4" />
                  </button>
                  <button
                    aria-label="Ver servicio relacionado"
                    onClick={() => {
                      setDefinition(null)
                      setUsageLimits(usageLimits => {
                        usageLimits.splice(index, 1)
                        return [...usageLimits]
                      })
                    }}
                    className="content-center transition-opacity duration-200 hover:opacity-80 cborder-l pl-2"
                  >
                    <Eraser className="size-4" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row justify-end items-end gap-2">
        <Button
          disabled={isSubmitting || status !== ORDER_STATUSES_KEYS.PLANNING}
          variant="outline"
          onClick={handleSave}
          className="w-full lg:w-fit lg:px-12"
        >
          {isSubmitting ? 'Procesando...' : 'Guardar cambios'}
        </Button>
        <Button
          disabled={status !== ORDER_STATUSES_KEYS.PLANNING}
          onClick={handleDownloadPreview}
          variant="outline"
          className="w-full lg:w-fit lg:px-12"
        >
          Descargar vista previa
        </Button>
        <Contract
          id={id}
          order={order}
          contract={{
            object: contractObject,
            goals,
            deliverables,
            usageLimits
          }}
          disabled={status !== ORDER_STATUSES_KEYS.PLANNING}
        />
      </div>
    </div>
  )
}

export default GenerateContractForm
