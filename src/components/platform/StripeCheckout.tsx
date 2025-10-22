import { useStripe, useElements } from '@stripe/react-stripe-js'
import { PaymentElement } from '@stripe/react-stripe-js/checkout'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { API_URL } from 'astro:env/client'
import { BadResponseError } from '@/lib/errors'
import { ORDER_STATUSES_KEYS } from '@/lib/constants'

async function fetchService(
  id: string
): Promise<
  { success: true; status: number } | { success: false; error: string }
> {
  try {
    const res = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'GET',
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)

    const body = await res.json()
    return {
      success: true,
      status: body.status
    }
  } catch {
    return {
      success: false,
      error: 'Ha ocurrido un error inesperado. Intenta de nuevo.'
    }
  }
}

interface Props {
  id: string
}

function StripeCheckout({ id }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/platform/services/${id}`
      },
      redirect: 'if_required'
    })

    if (error) {
      if (error.type === 'validation_error' || error.type === 'card_error') {
        toast.error(error.message, { duration: 5000 })
      } else {
        toast.error('Ha ocurrido un error inesperado. Intenta de nuevo.', {
          duration: 5000
        })
      }

      setIsLoading(false)
      return
    }

    let attempt = 0
    const loading = toast.loading('Validando el pago...')
    const interval = window.setInterval(async () => {
      if (attempt > 5) {
        toast.info(
          'No hemos podido verificar el pago en este momento. Puedes abrir un hilo para solicitar más información o verificar el estado del pago más tarde.',
          {
            duration: 5000
          }
        )

        toast.dismiss(loading)
        setIsLoading(false)
        clearInterval(interval)

        return
      }

      const res = await fetchService(id)
      if (!res.success) {
        toast.error(res.error, { duration: 5000 })

        toast.dismiss(loading)
        setIsLoading(false)
        clearInterval(interval)

        return
      }

      attempt++

      if (res.status === ORDER_STATUSES_KEYS.ON_HOLD) {
        toast.dismiss(loading)
        toast.success('El pago ha sido procesado con éxito.')
        toast.info('Te enviaremos tu factura cuando este disponible.', {
          duration: 3000
        })

        toast.dismiss(loading)
        clearInterval(interval)
        setIsLoading(false)

        setTimeout(() => {
          window.location.replace(`/platform/services/${id}`)
        }, 3000)
      }
    }, 3000)
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: 'accordion',
          business: {
            name: 'Works by yarso'
          },
          paymentMethodOrder: ['customer_balance', 'card']
        }}
      />
      <Button
        className="w-full mt-2"
        disabled={!stripe || !elements}
        variant="custom"
      >
        {isLoading ? 'Procesando...' : 'Completar pago'}
      </Button>
    </form>
  )
}

export default StripeCheckout
