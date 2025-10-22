import { ITEM_TYPES, ORDER_STATUSES_KEYS } from '@/lib/constants'
import type { Order } from '@/lib/types'
import { profitCalculator } from '@/lib/utils'
import { useMemo } from 'react'
import { Button } from '../ui/button'
import { CircleArrowOutUpRight } from 'lucide-react'

interface Props {
  id: string
  data: Pick<Order, 'status' | 'discount' | 'items' | 'payment_installments'>
}

function ItemsList({
  id,
  data: { status, discount, items, payment_installments: installments }
}: Props) {
  const costDistribution = useMemo(() => {
    return profitCalculator(
      items.reduce((acc, item) => acc + item.cost, 0),
      discount?.percentage ?? 0
    )
  }, [items, discount])

  return (
    <section className="mt-4">
      <h3 className="scroll-m-20 text-left text-xl lg:text-2xl font-extrabold tracking-tight text-balance">
        Artículos
      </h3>
      <div className="mt-2 cborder bg-csecondary max-h-[200px] overflow-y-auto">
        {items.length === 0 ? (
          <p className="p-2 w-full text-center opacity-60">
            No hay artículos que mostrar
          </p>
        ) : (
          <ul>
            {items.map(item => (
              <li
                className="cborder-b last:border-b-0 grid grid-cols-[1fr_1fr_auto] p-2"
                key={item.id}
              >
                <p className="truncate">{item.name}</p>
                <p className="cborder-l pl-2 truncate">
                  {ITEM_TYPES[item.type]}
                </p>
                <p className="cborder-l pl-2 truncate">
                  ${item.cost.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      {(status === ORDER_STATUSES_KEYS.PLANNING ||
        status === ORDER_STATUSES_KEYS.PAYMENT_REQUIRED) && (
        <div className="flex mt-2 flex-col items-end w-full cborder">
          {discount && (
            <div className="flex flex-col items-end w-full cborder-b">
              <p className="flex items-center justify-between gap-2 w-full cborder-b p-1">
                <span>Costo original:</span>
                <span className="opacity-85">
                  ${costDistribution.original.total.toLocaleString()}
                </span>
              </p>
              <p className="flex items-center justify-between gap-2 w-full px-1 pt-1">
                <span>Costo (Sin IVA):</span>
                <span className="opacity-85">
                  ${costDistribution.original.subtotal.toLocaleString()}
                </span>
              </p>
              <p className="flex items-center justify-between gap-2 w-full px-1 pb-1">
                <span>Descuento ({discount.percentage}%):</span>
                <span className="opacity-85">
                  -$
                  {costDistribution.discount.amount.toLocaleString()}
                </span>
              </p>
            </div>
          )}
          <div className="flex flex-col items-end w-full">
            <p className="flex items-center justify-between gap-2 w-full px-1 pt-1">
              <span>Subtotal:</span>

              <span className="opacity-85">
                ${costDistribution.final.subtotal.toLocaleString()}
              </span>
            </p>
            <p className="flex items-center justify-between gap-2 w-full px-1 pb-1">
              <span>IVA:</span>

              <span className="opacity-85">
                ${costDistribution.final.taxes.toLocaleString()}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end cborder-t w-full">
            <p className="flex items-center justify-between gap-2 w-full bg-csecondary p-1">
              <span className="font-semibold">Total:</span>

              <span className="text-contrast">
                ${costDistribution.final.total.toLocaleString()} MXN
              </span>
            </p>
          </div>
        </div>
      )}
      {status === ORDER_STATUSES_KEYS.PAYMENT_REQUIRED && (
        <div className="flex flex-col items-end mt-2 gap-8">
          {installments > 1 && (
            <p className="text-sm opacity-80">
              *{installments} pagos de{' '}
              {(costDistribution.final.total / installments).toLocaleString()}{' '}
              MXN
            </p>
          )}
          <Button asChild variant="outline">
            <a
              href={`/platform/services/${id}/checkout`}
              className="px-14 w-full lg:w-fit inline-flex gap-2 items-center"
            >
              <CircleArrowOutUpRight className="size-4 text-blue-500" />
              <p>Pagar mediante Stripe</p>
            </a>
          </Button>
        </div>
      )}
    </section>
  )
}

export default ItemsList
