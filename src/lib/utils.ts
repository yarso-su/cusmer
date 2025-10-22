import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TAXES = 0.16
const STRIPE_FIXED = 3
const STRIPE_COMMISSION = 0.016
const STRIPE_CLIENT_COMMISSION = 0.02

export function profitCalculator(total: number, discount_percentage: number) {
  // Trabajar con centavos para evitar errores de punto flotante
  const totalCents = Math.round(total * 100)
  const taxRate = Math.round(TAXES * 10000) // 1600 para 16%

  // 1. Extraer subtotal del total (que incluye IVA)
  // subtotal = total / (1 + tax_rate)
  const subtotalBeforeDiscountCents = Math.round(
    (totalCents * 10000) / (10000 + taxRate)
  )
  const subtotalBeforeDiscount = subtotalBeforeDiscountCents / 100
  const taxesBeforeDiscount = total - subtotalBeforeDiscount

  // 2. Aplicar descuento al subtotal
  const discountCents = Math.round(
    (subtotalBeforeDiscountCents * discount_percentage) / 100
  )
  const discount = discountCents / 100
  const subtotalAfterDiscountCents = subtotalBeforeDiscountCents - discountCents
  const subtotalAfterDiscount = subtotalAfterDiscountCents / 100

  // 3. Calcular total final y taxes de manera que sumen exacto
  const finalTotalCents = Math.round(
    (subtotalAfterDiscountCents * (10000 + taxRate)) / 10000
  )
  const finalTotal = finalTotalCents / 100
  const taxes = finalTotal - subtotalAfterDiscount

  // 4. Calcular comisiones de Stripe sobre el total final
  const clientCommissionCents =
    Math.round(finalTotalCents * STRIPE_CLIENT_COMMISSION) +
    Math.round(STRIPE_FIXED * 100)
  const clientCommission = clientCommissionCents / 100

  const ownCommissionCents = Math.round(finalTotalCents * STRIPE_COMMISSION)
  const ownCommission = ownCommissionCents / 100

  const totalStripeCommission = clientCommission + ownCommission

  // 5. Calcular lo que realmente recibe Stripe y lo que te queda
  const stripeReceived = finalTotal - clientCommission
  const netReceived = stripeReceived - ownCommission

  // 6. El profit es lo que te queda después de todos los descuentos y comisiones
  const profit = netReceived - taxes

  return {
    original: {
      total: +total.toFixed(2),
      subtotal: +subtotalBeforeDiscount.toFixed(2),
      taxes: +taxesBeforeDiscount.toFixed(2)
    },
    discount: {
      percentage: discount_percentage,
      amount: +discount.toFixed(2)
    },
    final: {
      subtotal: +subtotalAfterDiscount.toFixed(2),
      taxes: +taxes.toFixed(2),
      total: +finalTotal.toFixed(2)
    },
    stripe: {
      commission: {
        client: +clientCommission.toFixed(2),
        own: +ownCommission.toFixed(2),
        total: +totalStripeCommission.toFixed(2)
      },
      received: +stripeReceived.toFixed(2),
      netReceived: +netReceived.toFixed(2)
    },
    profit: +profit.toFixed(2)
  }
}
