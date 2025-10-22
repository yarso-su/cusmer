import type { FacturaProfile, Regime } from '@/lib/types'
import UpdateBillingProfileForm from './UpdateBillingProfileForm'
// import UpdateBillingForeignProfileForm from './UpdateBillingForeignProfileForm'

interface Props {
  catalog: {
    regimes: Array<Regime>
  }
  profile: FacturaProfile
}

function UpdateBillingProfile({ profile, catalog }: Props) {
  const { client: data } = profile

  // if (profile.foreign) {
  //   return (
  //     <UpdateBillingForeignProfileForm
  //       defaultValues={{
  //         razons: data.RazonSocial,
  //         pais: data.Pais,
  //         codpos: Number(data.CodigoPostal),
  //         email: data.Contacto.Email
  //       }}
  //       countries={catalog.countries}
  //     />
  //   )
  // }

  return (
    <UpdateBillingProfileForm
      defaultValues={{
        rfc: data.RFC,
        razons: data.RazonSocial,
        codpos: Number(data.CodigoPostal),
        email: data.Contacto.Email,
        regimen: data.RegimenId,
        calle: data.Calle || undefined,
        numero_exterior: data.Numero || undefined,
        numero_interior: data.Interior || undefined,
        colonia: data.Colonia || undefined,
        ciudad: data.Ciudad || undefined,
        delegacion: data.Delegacion || undefined,
        localidad: data.Ciudad || undefined,
        estado: data.Estado || undefined,
        telefono: data.Contacto.Telefono || undefined,
        email2: data.Contacto.Email2 || undefined,
        email3: data.Contacto.Email3 || undefined,
        nombre: data.Contacto.Nombre || undefined,
        apellidos: data.Contacto.Apellidos || undefined
      }}
      regimes={catalog.regimes}
    />
  )
}

export default UpdateBillingProfile
