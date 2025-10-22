import type { TDocumentDefinitions } from 'pdfmake/interfaces'
import type { ContractData, OrderWithContract } from './types'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
pdfMake.vfs = pdfFonts.vfs

interface ProfessionalInfo {
  company: string
  name: string
  address: string
  rfc: string
}

const professionalInfo: ProfessionalInfo = {
  company: '%NombreCompañia%',
  name: '%NombreCompleto%',
  address: '%DomicilioFiscal%',
  rfc: '%RFC%'
}

export const generateDefinition = (
  data: ContractData,
  order: Omit<OrderWithContract, 'status' | 'contract'>,
  client?: {
    legal_name: string
    rfc: string
    fullname: string
    address: string
    role: string
  }
): TDocumentDefinitions => {
  const features = data.goals
    .filter(goal => goal.type === 'feature')
    .map(goal => {
      return goal.description
    })
  const technologies = data.goals
    .filter(goal => goal.type === 'technology')
    .map(goal => {
      return goal.description
    })
  const restrictions = data.goals
    .filter(goal => goal.type === 'technical_restriction')
    .map(goal => {
      return goal.description
    })

  const deliverables = data.deliverables.map(deliverable => {
    return [
      deliverable.label,
      deliverable.description,
      deliverable.method,
      deliverable.acceptance
    ]
  })

  return {
    defaultStyle: { font: 'Roboto' },
    content: [
      {
        text: 'CONTRATO DE PRESTACIÓN DE SERVICIOS DE SOFTWARE',
        style: 'header'
      },
      {
        text: 'Entre:',
        margin: [0, 10, 0, 0]
      },
      {
        text: `${professionalInfo.company}, representada en este acto por el responsable del proyecto, el Ing. ${professionalInfo.name}, con domicilio en ${professionalInfo.address}, y con RFC ${client ? professionalInfo.rfc : 'XXXXXXXXXXX'}, en lo sucesivo denominado “El Prestador”.`
      },
      {
        text: 'Y:',
        margin: [0, 10, 0, 0]
      },
      {
        text: `${client?.legal_name ?? '[Razón social del Cliente]'}, con RFC ${client?.rfc ?? '[RFC de la empresa/persona]'} y domicilio en ${client?.address ?? '[domicilio fiscal de la empresa/persona]'}, representada en este acto por ${client?.fullname ?? '[nombre completo del representante]'}, en su carácter de "${client?.role ?? '[cargo]'}", en lo sucesivo denominada “El Cliente”.`,
        margin: [0, 0, 0, 10]
      },
      { text: 'CLÁUSULAS', style: 'subheader' },
      { text: 'A. Objeto del contrato', bold: true, margin: [0, 0, 0, 2] },
      {
        text: `El Prestador se obliga a ${data.object}, conforme a las especificaciones descritas en el Anexo A, y a entregar los productos definidos en el Anexo B.`
      },
      { text: 'B. Tiempo de entrega', bold: true, margin: [0, 10, 0, 2] },
      {
        text: order.is_recurring
          ? 'En virtud de que el presente servicio es de carácter recurrente y de naturaleza continua, no aplica un tiempo de entrega único. Las actividades se realizarán conforme al alcance pactado mes a mes y mientras el contrato permanezca vigente.'
          : `El proveedor se compromete a entregar los entregables pactados en un plazo estimado de ${order.weeks} semanas naturales contadas a partir de la fecha de confirmación del primer pago. Cualquier modificación a este plazo deberá ser acordada por ambas partes por escrito.`
      },
      {
        text: 'B.1. Retrasos imputables al proveedor',
        bold: true,
        margin: [10, 5, 0, 2]
      },
      {
        text: 'En caso de que el prestador del servicio no pueda cumplir con la duración estimada del servicio debido a causas imputables a su responsabilidad directa, el cliente tendrá derecho a:',
        margin: [35, 0, 0, 0]
      },
      {
        ol: [
          'Una extensión del plazo sin costo adicional, proporcional al retraso generado.'
        ],
        margin: [35, 10, 0, 10]
      },
      {
        text: 'Esta disposición no aplica si el retraso se debe a:',
        margin: [35, 0, 0, 0]
      },
      {
        ul: [
          'Falta de respuesta o colaboración del cliente.',
          'Modificaciones o solicitudes fuera del alcance inicialmente definido.',
          'Causas de fuerza mayor debidamente justificadas.'
        ],
        margin: [35, 10, 0, 0]
      },
      { text: 'C. Precio y forma de pago', bold: true, margin: [0, 10, 0, 2] },
      {
        text: order.is_recurring
          ? `El Cliente pagará al Prestador la cantidad de $${Number(order.total).toLocaleString()} MXN de forma mensual, correspondiente al servicio recurrente descrito en este contrato.

El pago será generado automáticamente por la plataforma del Prestador en ciclos mensuales a partir de la fecha del primer pago realizado por el Cliente, y continuará vigente mientras el servicio permanezca activo.

El Cliente podrá solicitar la cancelación del servicio con al menos 15 días naturales de anticipación al inicio del siguiente periodo mensual. En caso contrario, se generará el cobro correspondiente al nuevo periodo.

La falta de pago oportuno podrá dar lugar a la suspensión automática del servicio hasta su regularización.`
          : `El Cliente pagará al Prestador la cantidad total de $${Number(order.total).toLocaleString()} MXN, correspondiente al servicio descrito en este contrato. El pago se realizará en ${order.installments} parcialidades, conforme al esquema de pago diferido administrado por la plataforma del Prestador.

El calendario de pagos será determinado a partir de la fecha en que se registre el primer pago, y se dividirá de forma equitativa en intervalos de ${Math.ceil(order.weeks / order.installments)} semanas, durante un total de ${order.weeks} semanas. Cada parcialidad deberá ser cubierta en tiempo y forma a través del sistema automatizado de pagos habilitado por el Prestador.

El Cliente reconoce y acepta que la activación del servicio queda condicionada al primer pago. A partir de dicha fecha, el sistema generará automáticamente las tareas de cobro conforme al calendario indicado. En caso de falta de pago en alguno de los periodos, el Prestador podrá suspender temporalmente la prestación del servicio hasta la regularización correspondiente.`
      },
      {
        text: `C.1. ${order.is_recurring ? 'Renovación automática' : 'Sin renovación automática'}`,
        bold: true,
        margin: [10, 5, 0, 2]
      },
      {
        text: order.is_recurring
          ? 'En los servicios recurrentes, el contrato se renovará automáticamente de forma mensual, salvo notificación expresa de alguna de las partes. El Cliente podrá solicitar la cancelación de la renovación automática desde la plataforma con al menos 3 días de antelación al siguiente periodo de facturación.'
          : `Este contrato no contempla la renovación automática del servicio.
Una vez cumplido el objeto del servicio conforme a lo estipulado en el presente contrato, se considerará concluido sin que ello implique obligación de continuar con prestaciones futuras, salvo que ambas partes manifiesten su interés de manera expresa.

En caso de que el servicio implique pagos fraccionados o por parcialidades, el sistema de la plataforma establecerá el estado del servicio como “Pago requerido” al aproximarse la fecha correspondiente, y notificará al cliente mediante correo electrónico registrado.
Dicho aviso no constituye una obligación de renovación, sino una facilitación para el cumplimiento del acuerdo vigente. Los pagos deberán realizarse directamente a través de la plataforma.

Cualquier nuevo acuerdo de servicio posterior requerirá un nuevo registro formal en la plataforma y, en su caso, la celebración de un nuevo contrato.`,
        margin: [35, 0, 0, 0]
      },
      data.usageLimits.length > 0
        ? [
            {
              text: 'C.2. Límites de Uso',
              bold: true,
              margin: [10, 5, 0, 2]
            },
            {
              text: 'El presente servicio recurrente incluye los siguientes límites mensuales de uso técnico y operativo:',
              margin: [35, 0, 0, 0]
            },
            {
              ul: data.usageLimits.map(limit => {
                return `${limit.label}: hasta ${limit.amount} ${limit.unit}`
              }),
              margin: [35, 10, 0, 10]
            },
            {
              text: `
En caso de que alguno de los límites establecidos sea excedido, el sistema de la plataforma registrará el consumo adicional y generará el cargo correspondiente. Dicho cargo será calculado en función del costo unitario real del recurso en uso, según las tarifas vigentes del proveedor externo correspondiente (por ejemplo: Fly.io, Cloudflare, Supabase, etc.).

El Cliente reconoce que estos costos no son establecidos ni controlados por el Proveedor, y que no implican margen adicional ni comisión. El Proveedor se limita a trasladar el monto necesario para mantener la continuidad del servicio conforme al modelo de operación contratado.

Los cargos por excedente serán reflejados en la plataforma y deberán ser liquidados por el Cliente antes del siguiente ciclo mensual para evitar suspensión o degradación del servicio.`,
              margin: [35, 0, 0, 0]
            }
          ]
        : [],
      {
        text: 'D. Penalizaciones por impago o retraso',
        bold: true,
        margin: [0, 10, 0, 2]
      },
      {
        text: 'El impago o retraso en los pagos acordados podrá conllevar:',
        margin: [0, 0, 0, 0]
      },
      {
        ul: [
          'Suspensión del servicio de forma inmediata.',
          'Penalización del 5% sobre el monto vencido por cada 14 días naturales de retraso, hasta un máximo del 10%.',
          'Cancelación definitiva del servicio si el retraso supera los 30 días.'
        ],
        margin: [0, 10, 0, 10]
      },
      {
        text: 'El Proveedor se reserva el derecho de retener entregables, accesos o credenciales hasta regularización de pagos pendientes.',
        margin: [0, 0, 0, 0]
      },
      {
        text: 'E. Responsabilidades',
        bold: true,
        margin: [0, 10, 0, 2]
      },
      {
        text: 'El Proveedor se compromete a prestar los servicios descritos en el presente contrato conforme a los términos acordados. Es responsabilidad del Cliente:',
        margin: [0, 0, 0, 0]
      },
      {
        ul: [
          'Proporcionar la información, materiales o accesos necesarios en tiempo y forma.',
          'Dar seguimiento oportuno a los mensajes dentro de la plataforma.',
          'Revisar y aprobar avances conforme a los plazos acordados.'
        ],
        margin: [0, 10, 0, 10]
      },
      {
        text: 'El retraso por parte del Cliente en cualquiera de estos puntos podrá afectar la entrega del servicio, sin que esto represente incumplimiento por parte del Proveedor.',
        margin: [0, 0, 0, 0]
      },
      {
        text: 'F. Modificaciones',
        bold: true,
        margin: [0, 10, 0, 2]
      },
      {
        text: order.is_recurring
          ? 'En los servicios de administración o soporte recurrente, cualquier cambio sustancial en los términos del servicio (como incorporación o eliminación de recursos) deberá formalizarse mediante la terminación anticipada del presente servicio y la creación de uno nuevo con condiciones actualizadas. Los pagos efectuados no son reembolsables, salvo que se indique lo contrario por escrito.'
          : 'Cualquier modificación o ampliación del alcance originalmente pactado que implique un impacto en la estimación de tiempo o recursos requerirá la creación de un nuevo servicio y contrato independiente. No se garantiza la viabilidad de los nuevos requerimientos dentro del marco del presente contrato.',
        margin: [0, 0, 0, 0]
      },
      {
        text: 'G. Uso de herramientas de terceros',
        bold: true,
        margin: [0, 10, 0, 2]
      },
      {
        text: 'El Cliente reconoce y acepta que el Proveedor utiliza herramientas y servicios de terceros (como servicios de hosting, plataformas de pago, CDN, infraestructura en la nube, etc.) para la ejecución del servicio. El Proveedor no será responsable por interrupciones, fallas o modificaciones en dichas herramientas que escapen a su control.',
        margin: [0, 0, 0, 0]
      },
      {
        text: 'H. Subcontratación',
        bold: true,
        margin: [0, 10, 0, 2]
      },
      {
        text: 'El Proveedor podrá, a su discreción, subcontratar parte del servicio con terceros especializados (ej. generación de contenido visual, fotografía, producción audiovisual), manteniendo la responsabilidad sobre la calidad final y cumplimiento del contrato. El Cliente acepta que parte del trabajo pueda ser ejecutado por terceros seleccionados por el Proveedor.',
        margin: [0, 0, 0, 0]
      },
      {
        text: 'I. Propiedad intelectual',
        bold: true,
        margin: [0, 10, 0, 2]
      },
      {
        text: `Salvo pacto en contrario, todos los derechos de propiedad intelectual derivados de los entregables generados en el marco del presente servicio pertenecerán al cliente una vez realizado el pago completo correspondiente.

No obstante, el proveedor se reserva el derecho a conservar y reutilizar estructuras, metodologías, componentes técnicos, herramientas y demás elementos genéricos no exclusivos utilizados durante el desarrollo, siempre que no contengan información confidencial ni personalizada del cliente.

El cliente se compromete a no modificar, redistribuir, comercializar ni sublicenciar los entregables sin autorización previa, salvo que hayan sido expresamente cedidos con carácter pleno o exclusivo.

Cualquier licencia o cesión especial de derechos será establecida explícitamente en el registro del servicio correspondiente o en documentos adicionales acordados por ambas partes.`,
        margin: [0, 0, 0, 0]
      },

      {
        text: 'I.1. Autorización de Administración Técnica',
        bold: true,
        margin: [10, 5, 0, 2]
      },
      {
        text: 'El Cliente autoriza al Proveedor a administrar los recursos digitales asociados al servicio contratado, incluyendo pero no limitado a: editar, actualizar, modificar, desplegar, configurar y operar el contenido, aplicaciones, activos digitales, cuentas y servicios relacionados. Esta autorización no implica una cesión de derechos sobre dichos recursos, salvo que se especifique lo contrario, y estará vigente mientras se mantenga activo el servicio de administración o hasta que el Cliente revoque esta autorización por escrito.',
        margin: [35, 0, 0, 0]
      },
      {
        text: 'I.2. Servicios gratuitos o de demostración',
        bold: true,
        margin: [10, 5, 0, 2]
      },
      {
        text: 'En los casos en que el servicio sea otorgado a título de cortesía, prueba, promoción o mediante la aplicación de un descuento del cien por ciento (100%) sobre el precio habitual, el Cliente reconoce que los entregables, desarrollos o resultados producidos no implican cesión ni licencia de derechos de propiedad intelectual, salvo que se acuerde expresamente lo contrario por escrito entre las partes.',
        margin: [35, 0, 0, 0]
      },
      order.is_recurring
        ? [
            {
              text: 'I.3. Registro y Propiedad de Nombres de Dominio',
              bold: true,
              margin: [10, 5, 0, 2]
            },
            {
              text: 'En caso de que el Proveedor adquiera un nombre de dominio en representación del Cliente, se entenderá que dicho dominio pertenece al Cliente, aun cuando sea registrado inicialmente bajo una cuenta controlada por el Proveedor. El Cliente podrá solicitar la transferencia del dominio a una cuenta propia en cualquier momento, cubriendo los costos asociados a dicha transferencia. El Proveedor se compromete a facilitar dicho proceso sin condiciones adicionales, en un plazo máximo de 5 (cinco) días hábiles tras la solicitud formal del Cliente.',
              margin: [35, 0, 0, 0]
            }
          ]
        : [],
      order.portfolio_consent
        ? [
            {
              text: `I.${order.is_recurring ? '3' : '1'}. Consentimiento para uso en portafolio`,
              bold: true,
              margin: [10, 5, 0, 2]
            },
            {
              text: 'El Cliente acepta que el Prestador del servicio podrá incluir una mención general del proyecto desarrollado como parte de su portafolio profesional, únicamente con fines promocionales o de referencia comercial. Esta mención podrá incluir:',
              margin: [35, 0, 0, 0]
            },
            {
              ul: [
                'El nombre comercial del Cliente.',
                'El tipo de solución o servicio brindado (ej. sitio web, panel administrativo, API, etc.).',
                'Capturas generales o mockups del producto final, siempre que no incluyan información sensible, técnica o confidencial.'
              ],
              margin: [35, 10, 0, 10]
            },
            {
              text: 'Queda expresamente prohibido:',
              margin: [35, 0, 0, 0]
            },
            {
              ul: [
                'Publicar detalles técnicos del funcionamiento interno del sistema.',
                'Revelar estrategias comerciales, métricas privadas, información sensible del negocio o datos personales de los usuarios finales del Cliente.'
              ],
              margin: [35, 10, 0, 10]
            },
            {
              text: 'Este consentimiento se otorga a menos que el Cliente indique lo contrario explícitamente al inicio del servicio, o posteriormente mediante notificación escrita.',
              margin: [35, 0, 0, 0]
            }
          ]
        : [],
      {
        text: 'J. Soporte y mantenimiento',
        bold: true,
        margin: [0, 10, 0, 2]
      },
      {
        text: `El Proveedor brindará soporte limitado a través de los hilos habilitados en su plataforma durante el tiempo que el servicio se encuentre activo. Este soporte está orientado a resolver dudas, recibir retroalimentación y atender correcciones menores.

El Proveedor no está obligado a ofrecer formación, capacitación extensa o soporte fuera del horario o volumen razonable (entendido como más de 2 horas continuas sin servicio recurrente asociado).

Para servicios de desarrollo no recurrentes, el Proveedor ofrece actualizaciones correctivas gratuitas por un plazo de 3 meses posteriores a la entrega. Para solicitudes de mantenimiento correctivo o evolutivo más allá de este plazo, será necesario contratar un servicio independiente.`,
        margin: [0, 0, 0, 0]
      },
      {
        text: 'K. Cancelación anticipada',
        bold: true,
        margin: [0, 10, 0, 2]
      },
      {
        text: 'El Cliente podrá solicitar la cancelación anticipada del servicio en cualquier momento mediante notificación escrita a través de la plataforma. En caso de cancelación por parte del Cliente:',
        margin: [0, 0, 0, 0]
      },
      {
        ul: [
          'No se reembolsarán los pagos ya realizados',
          'Si el servicio ya inició, se entregará lo producido hasta la fecha sin obligación de finalizar funcionalidades incompletas.'
        ],
        margin: [0, 10, 0, 10]
      },
      {
        text: 'El Proveedor podrá cancelar anticipadamente el servicio si detecta incumplimientos por parte del Cliente, abuso de soporte, uso indebido de la plataforma, falta de pago o razones técnicas que imposibiliten la continuación del servicio. Se notificará con antelación razonable.',
        margin: [0, 0, 0, 0]
      },
      {
        text: 'L. Limitación de responsabilidad',
        bold: true,
        margin: [0, 10, 0, 2]
      },
      {
        text: 'El Proveedor no será responsable por:',
        margin: [0, 0, 0, 0]
      },
      {
        ul: [
          'Daños indirectos, incidentales o consecuenciales derivados del uso o mal uso de los productos o servicios entregados.',
          'Fallas en herramientas de terceros utilizadas como parte del servicio.',
          'Pérdidas de información, caídas de servicios externos, interrupciones por causas fuera del control del Proveedor.'
        ],
        margin: [0, 10, 0, 10]
      },
      {
        text: 'En cualquier caso, la responsabilidad total del Proveedor estará limitada al monto efectivamente pagado por el Cliente durante los últimos 30 días previos al evento que motive la reclamación.',
        margin: [0, 0, 0, 0]
      },
      {
        text: 'M. Confidencialidad del Contrato',
        bold: true,
        margin: [0, 10, 0, 2]
      },
      {
        text: 'Las partes acuerdan que el presente contrato, así como sus términos, condiciones, anexos y cualquier otra documentación derivada o relacionada, tienen carácter confidencial. Ninguna de las partes podrá divulgar, compartir, reproducir o hacer público el contenido del contrato, total o parcialmente, sin el consentimiento expreso y por escrito de la otra parte, salvo que sea requerido por mandato legal o por una autoridad competente.',
        margin: [0, 0, 0, 0]
      },
      {
        text: 'N. Jurisdicción y ley aplicable',
        bold: true,
        margin: [0, 10, 0, 2]
      },
      {
        text: 'Este contrato se rige por las leyes de los Estados Unidos Mexicanos. Para la interpretación y cumplimiento del presente acuerdo, las partes se someten a los tribunales competentes de la ciudad de Colima, Colima, México, renunciando a cualquier otro fuero que pudiera corresponderles por razón de su domicilio presente o futuro salvo que ambas partes acuerden lo contrario.',
        margin: [0, 0, 0, 0]
      },
      {
        text: 'Ñ. Vigencia del Contrato',
        bold: true,
        margin: [0, 10, 0, 2]
      },
      {
        text: `La vigencia del presente contrato dependerá del tipo de servicio contratado:

a) Servicios no recurrentes: Tendrán una duración definida, la cual será de ${order.weeks} semanas contadas a partir de la fecha del primer pago facturado.

b) Servicios recurrentes: Tendrán una vigencia indefinida, iniciando a partir de la fecha del primer pago facturado, y podrán ser cancelados por cualquiera de las partes mediante aviso escrito con al menos 10 (diez) días naturales de anticipación a la fecha de corte del siguiente período mensual.

En ambos casos, el Proveedor se reserva el derecho de suspender o dar por terminado el contrato de forma anticipada en caso de incumplimiento por parte del Cliente, conforme a lo establecido en las demás cláusulas del presente contrato.`,
        margin: [0, 0, 0, 0]
      },
      {
        text: 'O. Totalidad del Acuerdo',
        bold: true,
        margin: [0, 10, 0, 2]
      },
      {
        text: 'El presente contrato constituye el acuerdo íntegro entre las partes en relación con el objeto del mismo, y sustituye cualquier otro acuerdo, entendimiento o comunicación, verbal o escrita, anterior o simultánea. Ninguna modificación será válida a menos que conste por escrito y firmada por ambas partes.',
        margin: [0, 0, 0, 0]
      },
      {
        text: 'P. Aceptación y firma',
        bold: true,
        margin: [0, 10, 0, 2]
      },
      {
        text: `Las partes manifiestan su conformidad con todos los términos y condiciones establecidos en el presente contrato.
Este acuerdo se firma de forma electrónica mediante la plataforma DocuSign, reconociéndose como legalmente vinculante conforme a la legislación aplicable.`,
        margin: [0, 0, 0, 0]
      },
      {
        pageBreak: 'before',
        text: ' ANEXO A – Especificaciones Técnicas',
        style: 'subheader',
        margin: [0, 0, 0, 5]
      },
      {
        text: 'Nombre del proyecto:',
        bold: true,
        margin: [0, 0, 0, 2]
      },
      {
        text: order.name,
        margin: [0, 0, 0, 0]
      },
      {
        text: 'Descripción general:',
        bold: true,
        margin: [0, 10, 0, 2]
      },
      {
        text: order.description,
        margin: [0, 0, 0, 0]
      },
      {
        text: 'Tipo:',
        bold: true,
        margin: [0, 10, 0, 2]
      },
      {
        text: order.is_recurring ? 'Recurrente' : 'No recurrente',
        margin: [0, 0, 0, 0]
      },
      features.length > 0
        ? [
            {
              text: 'Funcionalidades:',
              bold: true,
              margin: [0, 10, 0, 0]
            },
            {
              ul: features,
              margin: [0, 10, 0, 0]
            }
          ]
        : [],
      technologies.length > 0
        ? [
            {
              text: 'Tecnologías:',
              bold: true,
              margin: [0, 10, 0, 0]
            },
            {
              ul: technologies,
              margin: [0, 10, 0, 0]
            }
          ]
        : [],
      restrictions.length > 0
        ? [
            {
              text: 'Restricciones técnicas:',
              bold: true,
              margin: [0, 10, 0, 0]
            },
            {
              ul: restrictions,
              margin: [0, 10, 0, 0]
            }
          ]
        : [],
      {
        pageBreak: 'before',
        text: ' ANEXO B – Lista de Entregables',
        style: 'subheader',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['25%', '35%', '20%', '20%'],
          body: [
            ['Entregable', 'Descripción', 'Medio de entrega', 'Aceptación'],
            ...deliverables
          ]
        }
      }
    ],
    styles: {
      header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
      subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] }
    }
  }
}

export const getBlob = (
  pdfDefinition: TDocumentDefinitions,
  timeoutMs = 5000
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    let resolved = false

    try {
      const pdfDoc = pdfMake.createPdf(pdfDefinition)

      pdfDoc.getBlob(blob => {
        if (resolved) return
        if (blob) {
          resolved = true
          resolve(blob)
        } else {
          resolved = true
          reject(new Error('No se generó ningún blob'))
        }
      })

      setTimeout(() => {
        if (!resolved) {
          resolved = true
          reject(new Error('Timeout: generación de PDF muy lenta o fallida'))
        }
      }, timeoutMs)
    } catch (err) {
      if (!resolved) {
        resolved = true
        reject(err)
      }
    }
  })
}
