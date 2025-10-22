import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { MAX_ITEMS_PER_PAGE } from '@/lib/constants'
import { BadResponseError } from '@/lib/errors'
import { format } from '@formkit/tempo'
import { API_URL } from 'astro:env/client'
import { Box, LoaderCircle, ReceiptText } from 'lucide-react'
import { useEffect, useState } from 'react'

type TPayment = {
  id: number
  order_id: number
  amount: number
  created_at: Date
}
type TRes =
  | {
      success: false
      error: string
    }
  | {
      success: true
      payments: Array<TPayment>
    }

async function fetchPayments(page = 1): Promise<TRes> {
  try {
    const res = await fetch(`${API_URL}/payments?page=${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)

    const data = await res.json()

    return {
      success: true,
      payments: data.payments
    }
  } catch (error) {
    console.error(error)

    return {
      success: false,
      error: 'Algo salió mal'
    }
  }
}

function PaymentsList() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [params, setParam] = useQueryParams()
  const [payments, setPayments] = useState<Array<TPayment>>([])

  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      return
    }

    setLoading(true)
    fetchPayments(params.page).then(res => {
      setLoading(false)

      if (!res.success) return

      setPayments(res.payments)
    })
  }, [params])

  return (
    <div className="flex flex-col min-h-0 gap-2">
      <section className="flex justify-end gap-1 flex-shrink-0">
        <Button
          variant="custom"
          disabled={typeof params.page !== 'number' || params.page === 1}
          onClick={() => {
            setParam('page', params.page - 1)
          }}
        >
          Anterior
        </Button>
        <Button
          variant="custom"
          disabled={payments.length < MAX_ITEMS_PER_PAGE}
          onClick={() => {
            setParam('page', params.page + 1)
          }}
        >
          Siguiente
        </Button>
      </section>
      <section className="cborder bg-csecondary flex-1 min-h-0 overflow-hidden">
        {payments.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="opacity-60 dark:opacity-40">
              {loading ? (
                <LoaderCircle className="animate-spin opacity-60 dark:opacity-40" />
              ) : (
                'No hay pagos que mostrar'
              )}
            </p>
          </div>
        ) : (
          <ul className="h-full overflow-y-auto">
            {payments.map(payment => (
              <li
                key={payment.id}
                className="cborder-b grid grid-cols-[auto_1fr_auto_auto_auto] p-2"
              >
                <div className="pl-2 pr-3">
                  <p className="text-center">{payment.id}</p>
                </div>
                <p className="cborder-l pl-2 truncate">
                  ${Number(payment.amount).toLocaleString()} MXN
                </p>
                <p className="cborder-l px-2 truncate">
                  {format(payment.created_at, 'long', 'es')}
                </p>
                <a
                  aria-label="Descargar comprobante"
                  target="_blank"
                  href={`${API_URL}/payments/${payment.id}`}
                  className="content-center transition-opacity duration-200 hover:opacity-80 cborder-l px-2"
                >
                  <ReceiptText className="size-4" />
                </a>
                <a
                  aria-label="Ver servicio relacionado"
                  href={`/platform/services/${payment.order_id}`}
                  className="content-center transition-opacity duration-200 hover:opacity-80 cborder-l pl-2"
                >
                  <Box className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default PaymentsList
