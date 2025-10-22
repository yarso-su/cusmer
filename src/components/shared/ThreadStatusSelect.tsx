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
  hideDefault?: boolean
}

function ThreadStatusSelect({
  className,
  hideDefault = false,
  ...props
}: Props) {
  return (
    <Select {...props}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Seleccione un estado" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Estados</SelectLabel>
          {!hideDefault && <SelectItem value="1">Abierto</SelectItem>}
          <SelectItem value="2">Archivado</SelectItem>
          <SelectItem value="3">Cerrado</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default ThreadStatusSelect
