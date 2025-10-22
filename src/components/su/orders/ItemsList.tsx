import { API_URL } from 'astro:env/client'
import AddItemForm from '@/components/su/AddItemForm'
import { ITEM_TYPES, ORDER_STATUSES_KEYS } from '@/lib/constants'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Edit, Trash } from 'lucide-react'
import UpdateItemForm from '../UpdateItemForm'
import { BadResponseError } from '@/lib/errors'
import { toast } from 'sonner'
import type { Order } from '@/lib/types'
import { profitCalculator } from '@/lib/utils'

interface Item {
  id: number
  name: string
  description: string
  type: number
  cost: number
}

interface Props {
  id: number
  data: Pick<Order, 'status' | 'discount' | 'items' | 'payment_installments'>
}

async function deleteItem(id: number): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/orders/items/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo eliminar el item'
  }
}

function ItemsList({
  id,
  data: {
    status: currentStatus,
    items: currentItems,
    payment_installments: currentInstallments,
    discount: currentDiscount
  }
}: Props) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [items, setItems] = useState(currentItems)
  const [status, setStatus] = useState(currentStatus)
  const [discount, setDiscount] = useState(currentDiscount)
  const [installments, setInstallments] = useState(currentInstallments)
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  const costDistribution = useMemo(() => {
    return profitCalculator(
      items.reduce((acc, item) => acc + item.cost, 0),
      discount?.percentage ?? 0
    )
  }, [items, discount])

  const onItemAdded = (item: Item) => {
    setItems([...items, item])
  }

  const onItemEdited = (item: Item) => {
    setItems(items.map(i => (i.id === item.id ? item : i)))
  }

  const deleteItemHandler = async (id: number) => {
    toast('Estas seguro que deseas eliminar este articulo?', {
      dismissible: true,
      duration: 5000,
      action: {
        label: 'Si',
        onClick: async () => {
          const res = await deleteItem(id)

          if (res) {
            toast.error(res)
            return
          }

          toast.success('Item eliminado')
          setItems(items.filter(i => i.id !== id))
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

  useEffect(() => {
    const updateDiscount = (e: CustomEvent) => {
      setDiscount(e.detail)
    }

    const statusChange = (e: CustomEvent) => {
      setStatus(e.detail)
    }

    const installmentsChange = (e: CustomEvent) => {
      setInstallments(e.detail)
    }

    document.addEventListener(
      'discount-updated',
      updateDiscount as EventListener
    )

    document.addEventListener('status-change', statusChange as EventListener)

    document.addEventListener(
      'installments-change',
      installmentsChange as EventListener
    )

    return () => {
      document.removeEventListener(
        'discount-updated',
        updateDiscount as EventListener
      )

      document.removeEventListener(
        'status-change',
        statusChange as EventListener
      )

      document.removeEventListener(
        'installments-change',
        installmentsChange as EventListener
      )
    }
  }, [])

  return (
    <section className="mt-4">
      <div className="flex justify-between items-end">
        <h3 className="scroll-m-20 text-left text-xl lg:text-2xl font-extrabold tracking-tight text-balance">
          Artículos
        </h3>
        {status === ORDER_STATUSES_KEYS.PLANNING && (
          <AddItemForm id={id} onItemAdded={onItemAdded} />
        )}
      </div>
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
                <div className="flex items-center gap-2">
                  <p className="cborder-l pl-2 truncate">
                    ${item.cost.toLocaleString()}
                  </p>
                  {status === ORDER_STATUSES_KEYS.PLANNING && (
                    <>
                      <button
                        className="cborder-l pl-2 transition-opacity duration-200 opacity-70 hover:opacity-100"
                        onClick={() => {
                          triggerRef.current?.click()
                          setEditingItem(item)
                        }}
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        className="cborder-l pl-2 transition-opacity duration-200 opacity-70 hover:opacity-100"
                        onClick={() => deleteItemHandler(item.id)}
                      >
                        <Trash className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {(status === ORDER_STATUSES_KEYS.PLANNING ||
        status === ORDER_STATUSES_KEYS.PAYMENT_REQUIRED) && (
        <div className="w-full mt-2">
          <div className="flex flex-col items-end w-full rounded-sm cborder">
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
              <p className="flex items-center justify-between gap-2 w-full p-1">
                <span>Total:</span>

                <span className="text-blue-500">
                  ${costDistribution.final.total.toLocaleString()} MXN
                </span>
              </p>
            </div>
            <div className="cborder-t w-full flex flex-col items-end">
              <p className="flex items-center justify-between gap-2 w-full bg-csecondary p-1">
                <span className="font-semibold">Ganancias:</span>
                <span className="text-contrast">
                  ${costDistribution.profit.toLocaleString()} MXN
                </span>
              </p>
            </div>
          </div>
          {installments > 1 && (
            <div className="flex justify-end mt-2 opacity-80">
              <p className="text-sm">
                *{installments} pagos de{' '}
                {(costDistribution.final.total / installments).toLocaleString()}{' '}
                MXN
              </p>
            </div>
          )}
        </div>
      )}
      <UpdateItemForm
        triggerRef={triggerRef}
        editingItem={editingItem}
        onItemEdited={onItemEdited}
      />
    </section>
  )
}

export default ItemsList
