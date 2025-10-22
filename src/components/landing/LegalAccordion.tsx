import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

function LegalAccordion() {
  return (
    <Accordion type="single" collapsible className="mt-4">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-sm md:text-base lg:text-lg">
          ¿Cómo gestionamos los contratos?
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-sm md:text-base lg:text-lg">
            Cada servicio que contratas con nosotros está respaldado por un
            contrato de Prestación de Servicios (u otro tipo según corresponda),
            redactado conforme a los principios del Código Civil Federal de
            México.
          </p>
          <p className="text-sm md:text-base lg:text-lg mt-4">
            Este contrato incluye de forma explícita el alcance del proyecto,
            duración, derechos de propiedad intelectual, entregables, cronograma
            y condiciones de pago, cumpliendo así con lo establecido en los
            artículos 1794 al 1803, que definen los elementos esenciales de un
            contrato válido.
          </p>

          <p className="text-sm md:text-base lg:text-lg mt-4">
            Todos nuestros contratos son firmados digitalmente a través de
            <a
              href="https://www.docusign.com/es-mx/soluciones/departamentos/juridico"
              target="_blank"
              rel="noreferrer noopener nofollow"
              referrerPolicy="no-referrer"
              className="underline decoration-2 underline-offset-2 decoration-blue-500 hover:text-black dark:hover:text-white transition-colors duration-200"
            >
              {' '}
              DocuSign
            </a>
            , en cumplimiento con los requisitos de validez establecidos por la
            legislación mexicana para medios electrónicos (Artículo 1834 del
            Código Civil Federal). Este sistema garantiza integridad,
            autenticidad y trazabilidad del consentimiento, brindándote
            seguridad jurídica en cada acuerdo.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger className="text-sm md:text-base lg:text-lg">
          ¿De qué manera cumplimos con la facturación?
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-sm md:text-base lg:text-lg">
            Como lo establece el Artículo 29 del Código Fiscal de la Federación,
            estamos obligados a emitir una factura electrónica (CFDI) por cada
            ingreso percibido. Cada concepto que se incluye en la factura por
            los servicios contratados corresponde a un elemento de nuestro
            catálogo interno de servicios y está vinculado con su respectiva
            clave de producto o servicio según el SAT (anexo 20 de la Resolución
            Miscelánea Fiscal).{' '}
          </p>
          <p className="text-sm md:text-base lg:text-lg mt-4">
            Para facilitar este proceso, contamos con una integración directa
            con{' '}
            <a
              href="https://factura.com/facturacion"
              target="_blank"
              rel="noreferrer noopener nofollow"
              referrerPolicy="no-referrer"
              className="underline decoration-2 underline-offset-2 decoration-blue-500 hover:text-black dark:hover:text-white transition-colors duration-200"
            >
              Factura.com
            </a>
            , lo que permite que la generación y entrega de las facturas se
            realice automáticamente desde nuestra plataforma. Cada usuario puede
            configurar un perfil de facturación con sus datos fiscales. En caso
            de no hacerlo, el sistema emitirá la factura usando un perfil
            genérico con el RFC de público en general (XAXX010101000), tal como
            lo permite la normativa fiscal vigente.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger className="text-sm md:text-base lg:text-lg">
          ¿Cómo nos aseguramos de que los pagos sean seguros?
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-sm md:text-base lg:text-lg">
            Todos los pagos se procesan de forma segura a través de nuestra
            integración con{' '}
            <a
              href="https://stripe.com/en-mx/payments"
              target="_blank"
              rel="noreferrer noopener nofollow"
              referrerPolicy="no-referrer"
              className="underline decoration-2 underline-offset-2 decoration-blue-500 hover:text-black dark:hover:text-white transition-colors duration-200"
            >
              Stripe
            </a>
            , una plataforma global de procesamiento de pagos utilizada por
            millones de empresas en más de 100 países. Stripe cumple con los más
            altos estándares de seguridad, incluyendo la certificación PCI DSS
            Nivel 1, exigida por la industria de tarjetas de pago para el manejo
            de datos financieros.
          </p>
          <p className="text-sm md:text-base lg:text-lg mt-4">
            Conforme a las mejores prácticas internacionales y a lo establecido
            en la Ley Federal de Protección de Datos Personales en Posesión de
            los Particulares, no almacenamos directamente ningún dato sensible
            de tarjetas, cuentas bancarias ni métodos de pago dentro de nuestros
            servicios. Toda la información financiera es manejada exclusivamente
            por Stripe mediante una conexión segura y cifrada.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger className="text-sm md:text-base lg:text-lg">
          ¿Cuál es nuestro estatus legal?
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-sm md:text-base lg:text-lg">
            Actualmente operamos como persona física bajo el marco legal
            mexicano. Todos los contratos y facturas son emitidos a nombre del
            responsable del proyecto, cumpliendo con las obligaciones fiscales y
            legales establecidas por las autoridades en México.
          </p>
          <p className="text-sm md:text-base lg:text-lg mt-4">
            Aunque aún no constituimos una empresa formal, nuestro equipo
            mantiene estándares profesionales en todos los aspectos del
            servicio: desde la formalización de contratos, hasta el
            procesamiento de pagos seguros a través de Stripe y la emisión de
            facturas electrónicas certificadas mediante Factura.com.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default LegalAccordion
