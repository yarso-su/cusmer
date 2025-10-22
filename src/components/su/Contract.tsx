import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  getStoredPrivateKey,
  importPrivateKey,
  safeDecryptSecret
} from '@/lib/crypto'
import { BadResponseError } from '@/lib/errors'
import { generateDefinition, getBlob } from '@/lib/pdfmake'
import type {
  ContractComplement,
  ContractData,
  OrderWithContract
} from '@/lib/types'
import { API_URL } from 'astro:env/client'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

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
  disabled: boolean
  contract: ContractData
  order: Omit<OrderWithContract, 'status' | 'contract'>
}

function Contract({ id, disabled, contract, order }: Props) {
  const [complement, setComplement] = useState<ContractComplement | null>(null)

  const handleOpen = useCallback(async (e: boolean) => {
    if (e !== true) return

    const loading = toast.loading('Cargando complemento...')
    const res = await fetchComplement(id)
    toast.dismiss(loading)

    if (!res.success) {
      return toast.error(res.error)
    }

    if (res.complement === null) {
      return toast.error(
        'El cliente aun no ha cargado el complemento para sus contratos'
      )
    }

    toast.success('Complemento cargado')
    setComplement(res.complement)
  }, [])

  const handleDownload = async () => {
    const loading = toast.loading('Generando vista previa...')

    if (complement === null) {
      return toast.error('No se pudo descargar el complemento')
    }

    try {
      const key = getStoredPrivateKey()
      if (!key) {
        toast.error('Dispositivo no registrado')
        return
      }

      const privateKey = await importPrivateKey(key)
      const decrypted = await Promise.all(
        Object.keys(complement).map(async el => {
          const secret = complement[el as keyof ContractComplement]
          return {
            key: el,
            value: await safeDecryptSecret(
              {
                key: secret.key,
                content: secret.content,
                iv: secret.iv
              },
              privateKey
            )
          }
        })
      )

      const data = Object.fromEntries(
        decrypted.map(item => [item.key, item.value])
      ) as {
        legal_name: string
        rfc: string
        fullname: string
        address: string
        role: string
      }

      const pdf = generateDefinition(contract, order, data)

      const blob = await getBlob(pdf)
      toast.dismiss(loading)

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'contrato.pdf'
      a.click()
      URL.revokeObjectURL(url)

      toast.dismiss(loading)
      toast.success('Versión final generada')
    } catch (err) {
      toast.dismiss(loading)
      toast.error(
        'Error al intentar descifrar la entrada. Si persiste reporta el problema'
      )
    }
  }

  return (
    <Dialog onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="w-full lg:w-fit lg:px-12">
          Generar versión final
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generar versión final</DialogTitle>
          <DialogDescription>
            PDF generado con los datos reales del cliente. Se recomienda
            discreción
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            onClick={handleDownload}
            disabled={complement === null}
            type="submit"
          >
            Descargar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default Contract
