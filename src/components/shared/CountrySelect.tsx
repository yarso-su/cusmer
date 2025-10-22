import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { Country } from '@/lib/types'
import type { SelectProps } from '@radix-ui/react-select'

interface Props extends React.ComponentProps<React.FC<SelectProps>> {
  className?: string
  countries: Array<Country>
}

function CountrySelect({ className, countries, ...props }: Props) {
  return (
    <Select {...props}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Seleccione un pais" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Paises</SelectLabel>
          {countries.map(({ key, name }) => (
            <SelectItem key={key} value={key}>
              {name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default CountrySelect
