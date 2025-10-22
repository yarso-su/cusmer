import OrderStatusSelect from '@/components/shared/OrderStatusSelect'
import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { MAX_ITEMS_PER_PAGE, ORDER_STATUSES } from '@/lib/constants'
import { BadResponseError } from '@/lib/errors'
import { API_URL } from 'astro:env/client'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

type TOrder = { id: number; name: string; tag: string; status: number }
type TRes =
  | {
      success: false
      error: string
    }
  | {
      success: true
      orders: Array<TOrder>
    }

async function fetchOrders(status = 4, page = 1): Promise<TRes> {
  try {
    const res = await fetch(`${API_URL}/orders/by-status/${status}/${page}`, {
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
      orders: data.orders
    }
  } catch (error) {
    console.error(error)

    return {
      success: false,
      error: 'Algo salió mal'
    }
  }
}

function OrdersList() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [params, setParam] = useQueryParams()
  const [orders, setOrders] = useState<Array<TOrder>>([])

  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      return
    }

    setLoading(true)
    fetchOrders(params.status, params.page).then(res => {
      setLoading(false)

      if (!res.success) return

      setOrders(res.orders)
    })
  }, [params])

  return (
    <div className="flex flex-col min-h-0 gap-2">
      <section className="flex justify-end gap-1 flex-shrink-0">
        <OrderStatusSelect
          defaultValue={params.status ?? '4'}
          onValueChange={value => {
            setParam('page', '1')
            setParam('status', value)
          }}
        />
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
          disabled={orders.length < MAX_ITEMS_PER_PAGE}
          onClick={() => {
            setParam('page', params.page + 1)
          }}
        >
          Siguiente
        </Button>
      </section>
      <section className="cborder bg-csecondary flex-1 min-h-0 overflow-hidden">
        {orders.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="opacity-60 dark:opacity-40">
              {loading ? (
                <LoaderCircle className="animate-spin opacity-60 dark:opacity-40" />
              ) : (
                'No hay servicios que mostrar'
              )}
            </p>
          </div>
        ) : (
          <ul className="h-full overflow-y-auto">
            {orders.map(order => (
              <li key={order.id}>
                <a
                  className="cborder-b  grid grid-cols-[1fr_1fr_auto] p-2 pressable-hover"
                  href={`/su/services/${order.id}`}
                >
                  <p className="truncate">{order.name}</p>
                  <p className="cborder-l pl-2 truncate">{order.tag}</p>
                  <div className="px-2">
                    <p className="cborder-l pl-2">
                      {ORDER_STATUSES[order.status]}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default OrdersList
