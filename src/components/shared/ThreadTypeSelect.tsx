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

interface Props extends SelectProps {
  className?: string
}

function ThreadTypeSelect({ className, ...props }: Props) {
  return (
    <Select {...props}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Seleccione un tipo" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Tipos</SelectLabel>
          <SelectItem value="1">Soporte técnico</SelectItem>
          <SelectItem value="2">Nueva funcionalidad</SelectItem>
          <SelectItem value="3">Nueva iniciativa</SelectItem>
          <SelectItem value="4">Consulta rápida</SelectItem>
          <SelectItem value="5">Planificación</SelectItem>
          <SelectItem value="6">Pagos y Facturación</SelectItem>
          <SelectItem value="7">Revisión / Feedback</SelectItem>
          <SelectItem value="8">Acceso y configuración</SelectItem>
          <SelectItem value="9">Administración y legal</SelectItem>
          <SelectItem value="10">Otro</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default ThreadTypeSelect
