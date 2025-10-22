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

function ItemTypeSelect({ className, ...props }: Props) {
  return (
    <Select {...props}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Seleccione un tipo" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Tipos</SelectLabel>
          <SelectItem value="1">SaaS</SelectItem>
          <SelectItem value="2">
            Administración de sistema y componentes
          </SelectItem>
          <SelectItem value="3">Administración de aplicaciones</SelectItem>
          <SelectItem value="4">Desarrollo de aplicaciones web</SelectItem>
          <SelectItem value="5">Desarrollo de aplicaciones servidor</SelectItem>
          <SelectItem value="6">Planificación de sistemas</SelectItem>
          <SelectItem value="7">Arquitectura de sistemas</SelectItem>
          <SelectItem value="8">Diseño de bases de datos</SelectItem>
          <SelectItem value="9">Diseño de sitios web y UX</SelectItem>
          <SelectItem value="10">Ingeniería</SelectItem>
          <SelectItem value="11">
            Implementación y despliegue de aplicaciones
          </SelectItem>
          <SelectItem value="12">
            Desarrollo de software personalizado (No-Web)
          </SelectItem>
          <SelectItem value="13">
            Implementación de funcionalidades del sistema
          </SelectItem>
          <SelectItem value="14">Mantenimiento de software</SelectItem>
          <SelectItem value="15">Soporte técnico y asistencia</SelectItem>
          <SelectItem value="16">Actualización de software</SelectItem>
          <SelectItem value="17">Soporte técnico y asistencia</SelectItem>
          <SelectItem value="18">Análisis de sistemas</SelectItem>
          <SelectItem value="19">Análisis de bases de datos</SelectItem>
          <SelectItem value="20">Diseño de aplicaciones PC</SelectItem>
          <SelectItem value="21">Diseño de integración de sistemas</SelectItem>
          <SelectItem value="22">Desarrollo de software</SelectItem>
          <SelectItem value="23">
            Administración de información del sistema MIS
          </SelectItem>
          <SelectItem value="24">
            Servicios de investigación y desarrollo temporal
          </SelectItem>
          <SelectItem value="25">
            Investigación y desarrollo de productos
          </SelectItem>
          <SelectItem value="26">
            Investigación y desarrollo de aplicaciones
          </SelectItem>
          <SelectItem value="27">
            Mantenimiento de software de desarrollo
          </SelectItem>
          <SelectItem value="28">
            Patente, marca de comercio y derechos de autor
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default ItemTypeSelect
