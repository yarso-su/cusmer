import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { OrderSummary } from '@/lib/types'
import type { SelectProps } from '@radix-ui/react-select'

interface Props extends React.ComponentProps<React.FC<SelectProps>> {
  orders: Array<OrderSummary>
  className?: string
}

function OrderSelect({ orders, className, ...props }: Props) {
  return (
    <Select {...props}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Seleccione un servicio" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Servicios</SelectLabel>
          {orders.map(order => (
            <SelectItem key={order.id} value={String(order.id)}>
              {order.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default OrderSelect
