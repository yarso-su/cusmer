import { useEffect } from 'react'
import { toast } from 'sonner'
import CreateBillingProfile from './CreateBillingProfile'
import type { Regime } from '@/lib/types'
// import CreateBillingForeignProfile from './CreateBillingForeignProfile'

interface Props {
  regimes: Array<Regime>
}

function SaveBillingProfileForms({ regimes }: Props) {
  useEffect(() => {
    toast.info('¡Atención!', {
      onDismiss: () =>
        toast.info('¡Atención!', {
          onDismiss: () =>
            toast.info('¡Atención!', {
              onDismiss: () => {
                if (window.matchMedia('(max-width: 1024px)').matches) {
                  toast.warning('¡Atención!', {
                    description: `En dispositivos móviles es posible que no se muestren todo los campos opcionales.`,
                    closeButton: true,
                    duration: 10000
                  })
                }
              },
              closeButton: true,
              description: `Si deseas que tus pagos sean deducibles o
            contabilizados a tu nombre, te recomendamos configurar tu perfil de
            facturación antes de realizar cualquier pago.`,
              dismissible: true,
              duration: 30000
            }),
          closeButton: true,
          description: `En caso de no proporcionar un RFC válido para
            emitir una factura a tu nombre, el ingreso será reportado utilizando
            el RFC genérico para operaciones con el público en general:
            XAXX010101000.`,
          dismissible: true,
          duration: 30000
        }),
      closeButton: true,
      description: `Estimad@ usuario, configurar un perfil de facturación no es
            obligatorio para el uso de la plataforma. Sin embargo, conforme al
            artículo 29 del Código Fiscal de la Federación y la regla 2.7.1.24
            de la Resolución Miscelánea Fiscal vigente, todo ingreso debe estar
            debidamente facturado.`,
      dismissible: true,
      duration: 30000
    })
  }, [])

  return (
    <div className="mt-2">
      <CreateBillingProfile regimes={regimes} />
    </div>
  )
}

export default SaveBillingProfileForms
