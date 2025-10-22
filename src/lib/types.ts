export interface Order {
  id: number
  name: string
  description: string
  tag: string
  status: number
  payment_installments: number
  duration_weeks: number
  is_recurring: boolean
  portfolio_consent: boolean
  user: {
    id: string
    name: string
  }
  items: Array<{
    id: number
    name: string
    description: string
    type: number
    cost: number
  }>
  discount?: {
    description: string
    percentage: number
  }
}

export interface OrderSummary {
  id: number
  name: string
}

export interface OrderWithContract
  extends Pick<
    Order,
    'name' | 'description' | 'status' | 'is_recurring' | 'portfolio_consent'
  > {
  installments: number
  weeks: number
  total: number
  contract: string | undefined
}

export interface User {
  name: string
  email: string
  verified: boolean
  role: number
  active: boolean
}

export interface Regime {
  key: string
  name: string
}

export interface Country {
  key: string
  name: string
}

export interface FacturaProfile {
  client: {
    RazonSocial: string
    RFC: string
    RegimenId: string
    Calle: string | null
    Numero: string | null
    Interior: string | null
    Colonia: string | null
    CodigoPostal: string
    Ciudad: string | null
    Localidad: string | null
    Delegacion: string | null
    Estado: string | null
    Pais: string
    NumRegIdTrib: string | null
    UsoCfdi: string | null
    Contacto: {
      Nombre: string | null
      Apellidos: string | null
      Email: string
      Email2: string | null
      Email3: string | null
      Telefono: string | null
    }
    UID: string
    cfdis: number
  }
  foreign: boolean
}

export interface Secret {
  id: number
  label: string
  key: string
  content: string
  iv: string
  updated_at: string
}

export interface OperatingCost {
  id: number
  amount: string
  note: string
}

export interface ContractData {
  object: string
  goals: Array<{
    description: string
    type: 'feature' | 'technology' | 'technical_restriction'
  }>
  deliverables: Array<{
    label: string
    description: string
    method: string
    acceptance: string
  }>
  usageLimits: Array<{
    label: string
    unit: string
    amount: number
  }>
}
export type ContractComplement = Record<
  'legal_name' | 'rfc' | 'fullname' | 'address' | 'role',
  {
    id: number
    key: string
    content: string
    iv: string
    updated_at: Date
  }
>
