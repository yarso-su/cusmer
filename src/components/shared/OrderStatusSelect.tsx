import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { SelectProps } from '@radix-ui/react-select'

interface Props extends React.ComponentProps<React.FC<SelectProps>> {
  className?: string
}

function OrderStatusSelect({ className, ...props }: Props) {
  return (
    <Select {...props}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Seleccione un estado" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Estados</SelectLabel>
          <SelectItem value="1">En planificación</SelectItem>
          <SelectItem value="2">Pago requerido</SelectItem>
          <SelectItem value="3">En desarrollo</SelectItem>
          <SelectItem value="4">En producción</SelectItem>
          <SelectItem value="5">En mantenimiento</SelectItem>
          <SelectItem value="6">Revisión del cliente</SelectItem>
          <SelectItem value="7">En espera</SelectItem>
          <SelectItem value="8">Archivado</SelectItem>
          <SelectItem value="9">Cancelado</SelectItem>
          <SelectItem value="10">Completado</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default OrderStatusSelect
