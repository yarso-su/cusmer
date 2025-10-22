import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type {
  ContractComplement,
  ContractData,
  OrderWithContract
} from '@/lib/types'
import { GOAL_TYPES, ORDER_STATUSES_KEYS } from '@/lib/constants'
import { API_URL } from 'astro:env/client'
import { BadResponseError } from '@/lib/errors'
import SaveComplementForm from './SaveComplementForm'
import { generateDefinition, getBlob } from '@/lib/pdfmake'

const fetchComplement = async (
  id: number
): Promise<
  | { success: true; complement: ContractComplement }
  | { success: false; error: string }
> => {
  try {
    const res = await fetch(
      `${API_URL}/users/contract-complement?order_id=${id}`,
      {
        method: 'GET',
        credentials: 'include'
      }
    )

    if (!res.ok) throw new BadResponseError(res)

    const body = await res.json()
    return {
      success: true,
      complement: body.complement
    }
  } catch (err) {
    if (err instanceof BadResponseError)
      return { success: false, error: err.message }

    return { success: false, error: 'No se pudo cargar el complemento' }
  }
}

interface Props {
  id: number
  status: number
  contract: string | undefined
  order: Omit<OrderWithContract, 'status' | 'contract'>
}

function GenerateContract({
  id,
  status,
  order,
  contract: contractString
}: Props) {
  const content = useMemo(() => {
    if (typeof contractString !== 'string') return null

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

    return contract
  }, [])
  const definition = useMemo(() => {
    if (content === null) return null
    return generateDefinition(content, order)
  }, [content])

  const [complementLoaded, setComplementLoaded] = useState(false)

  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const handleDownloadPreview = useCallback(async () => {
    if (content === null || definition === null) {
      return toast.error('Parece que el administrador no ha creado el contrato')
    }

    const loading = toast.loading('Generando vista previa...')
    try {
      const blob = await getBlob(definition)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'borrador.pdf'
      a.click()
      URL.revokeObjectURL(url)

      toast.dismiss(loading)
      toast.success('Vista previa generada')
    } catch (err) {
      console.error(err)
      toast.dismiss(loading)
      toast.error('No se pudo generar la vista previa')
    }
  }, [definition])

  useEffect(() => {
    fetchComplement(id).then(res => {
      if (!res.success) {
        return toast.error(res.error)
      }

      if (res.complement === null) {
        return toast.info(
          'Para que el administrador pueda generar la versión final, debes cargar el complemento. Quieres cargarlo en este momento?',
          {
            duration: 5000,
            action: {
              label: 'Si',
              onClick: () => triggerRef.current?.click()
            },
            actionButtonStyle: {
              backgroundColor: 'oklch(68.5% 0.169 237.323)',
              color: 'white'
            }
          }
        )
      }

      setComplementLoaded(true)
    })
  }, [])

  return (
    <div className="h-full grid grid-rows-[1fr_auto] gap-2">
      <div>
        <div>
          <label className="mb-2 flex items-center gap-2 lg:text-lg leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
            Objeto del contrato
          </label>
          <p className="p-2 cborder bg-csecondary">{content?.object}</p>
        </div>
        <div className="mt-4">
          <p className="font-semibold lg:text-lg">Objetivos</p>
          <ul className="bg-csecondary cborder rounded-sm mt-1 max-h-[200px] overflow-y-auto">
            {(Array.isArray(content?.goals) ? content.goals : []).length ===
            0 ? (
              <p className="p-2 text-center opacity-70">Aún no hay objetivos</p>
            ) : (
              (Array.isArray(content?.goals) ? content.goals : []).map(
                (goal, index) => (
                  <li
                    key={index}
                    className="cborder-b last:border-b-0 grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_200px] p-2"
                  >
                    <p className="truncate">{goal.description}</p>
                    <p className="cborder-l px-2 truncate">
                      {GOAL_TYPES[goal.type]}
                    </p>
                  </li>
                )
              )
            )}
          </ul>
        </div>
        <div className="mt-4">
          <p className="font-semibold lg:text-lg">Entregables</p>
          <ul className="bg-csecondary cborder rounded-sm mt-1 max-h-[200px] overflow-y-auto">
            {(Array.isArray(content?.deliverables) ? content.deliverables : [])
              .length === 0 ? (
              <p className="p-2 text-center opacity-70">
                Aún no hay entregables de uso
              </p>
            ) : (
              (Array.isArray(content?.deliverables)
                ? content.deliverables
                : []
              ).map((deliverable, index) => (
                <li
                  key={index}
                  className="cborder-b last:border-b-0 grid grid-cols-[1fr_1fr_2fr_2fr] p-2"
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
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="mt-4">
          <p className="font-semibold lg:text-lg">Límites de uso</p>
          <ul className="bg-csecondary cborder rounded-sm mt-1 max-h-[200px] overflow-y-auto">
            {(Array.isArray(content?.usageLimits) ? content.usageLimits : [])
              .length === 0 ? (
              <p className="p-2 text-center opacity-70">
                Aún no hay límites de uso
              </p>
            ) : (
              (Array.isArray(content?.usageLimits)
                ? content.usageLimits
                : []
              ).map((limit, index) => (
                <li
                  key={index}
                  className="cborder-b last:border-b-0 grid grid-cols-[2fr_2fr_1fr] p-2"
                >
                  <p className="truncate">{limit.label}</p>
                  <p className="cborder-l px-2 truncate">{limit.unit}</p>
                  <p className="cborder-l px-2 truncate">
                    {Number(limit.amount).toLocaleString()}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row justify-end items-end gap-2">
        {!complementLoaded && (
          <SaveComplementForm
            onSuccess={() => setComplementLoaded(true)}
            triggerRef={triggerRef}
          />
        )}
        <Button
          disabled={status !== ORDER_STATUSES_KEYS.PLANNING}
          onClick={handleDownloadPreview}
          className="w-full lg:w-fit lg:px-12"
        >
          Descargar vista previa
        </Button>
      </div>
    </div>
  )
}

export default GenerateContract
