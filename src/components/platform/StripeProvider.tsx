import { STRIPE_PUBLISHABLE_KEY } from 'astro:env/client'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import StripeCheckout from './StripeCheckout'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)

interface Color {
  background: string
  foreground: string
}

const themes: Record<string, Color> = {
  light: {
    background: '#fafafa',
    foreground: '#111827'
  },
  dark: {
    background: '#111111',
    foreground: '#F9FAFB'
  }
}

interface Props {
  id: string
  data: {
    clientSecret: string
    intentId: string
    userHaveBillingProfile: boolean
  }
}

function StripeProvider({
  id,
  data: { clientSecret, userHaveBillingProfile }
}: Props) {
  const [colors, setColors] = useState<Color>(() => {
    return document.documentElement.classList.contains('dark')
      ? themes.dark
      : themes.light
  })

  useEffect(() => {
    if (!userHaveBillingProfile) {
      toast.warning(
        'No tienes un perfil de facturación configurado. Si realizas el pago en este momento la factura sera "Global".',
        { duration: 8000 }
      )
    }

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark')
      setColors(isDark ? themes.dark : themes.light)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="w-full">
      <Elements
        options={{
          clientSecret,
          loader: 'always',
          appearance: {
            labels: 'floating',
            disableAnimations: true,
            theme: 'stripe',
            variables: {
              fontFamily: 'sans-serif',
              fontSmooth: 'antialiased',
              fontSizeBase: '14px',
              colorPrimary: '#2b7fff',
              focusBoxShadow: 'none',
              colorBackground: colors.background,
              colorText: colors.foreground
            }
          },
          locale: 'es'
        }}
        stripe={stripePromise}
      >
        <StripeCheckout id={id} />
      </Elements>
    </div>
  )
}

export default StripeProvider
