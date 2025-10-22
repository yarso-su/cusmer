import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { Regime } from '@/lib/types'
import type { SelectProps } from '@radix-ui/react-select'

interface Props extends React.ComponentProps<React.FC<SelectProps>> {
  className?: string
  regimes: Array<Regime>
}

function RegimeSelect({ className, regimes, ...props }: Props) {
  return (
    <Select {...props}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Seleccione un regimen fiscal" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Regimenes</SelectLabel>
          {regimes.map(({ key, name }) => (
            <SelectItem key={key} value={key}>
              {name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default RegimeSelect
