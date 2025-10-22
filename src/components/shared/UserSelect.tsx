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
  users: Array<{ id: string; name: string }>
}

function UserSelect({ users, ...props }: Props) {
  return (
    <Select {...props}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Seleccione un cliente" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Clientes</SelectLabel>
          {users.map(user => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default UserSelect
