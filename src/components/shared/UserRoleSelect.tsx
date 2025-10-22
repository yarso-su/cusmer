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

function UserRoleSelect({ className, ...props }: Props) {
  return (
    <Select {...props}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Seleccione un rol" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Roles</SelectLabel>
          <SelectItem value="1">Administrator</SelectItem>
          <SelectItem value="2">Desarrollador</SelectItem>
          <SelectItem value="3">Cliente</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default UserRoleSelect
