import InfiniteMovingCards from './InfiniteMovingCards'

const items_a = [
  {
    title: 'Automatización de procesos administrativos',
    description:
      'Eliminamos tareas repetitivas. Desde gestión de clientes hasta control de inventario: si puede hacerse solo, lo hacemos automático.'
  },
  {
    title: 'Integración de servicios',
    description:
      'Extendemos sistemas existentes con herramientas modernas como pagos en línea, facturación automática, generación de contratos y más.'
  },
  {
    title: 'Administración de sistemas',
    description:
      'Nos encargamos del mantenimiento, pagos y monitoreo de los servicios que sostienen tu sistema.'
  }
]

const items_b = [
  {
    title: 'Desarrollo de sistemas a la medida',
    description:
      'Diseñamos y construimos soluciones completas desde cero. Ya sea un sistema interno o una plataforma para tus clientes.'
  },
  {
    title: 'Desarrollo web personalizado',
    description:
      'Creamos sitios y aplicaciones web con diseño, funcionalidad y rendimiento alineados a tus objetivos.'
  },
  {
    title: 'Desarrollo móvil a la medida',
    description:
      'Aplicaciones móviles intuitivas, rápidas y hechas para escalar. Desde MVPs hasta apps robustas para Android y iOS.'
  }
]

const items_c = [
  {
    title: 'Codificación y soporte puntual',
    description:
      '¿Ya tienes un equipo o una idea en marcha? Podemos ayudarte con tareas específicas de programación.'
  },
  {
    title: 'Consultoría técnica',
    description:
      'Te orientamos para tomar buenas decisiones técnicas: desde cómo escalar tu sistema hasta cómo proteger tus datos.'
  },
  {
    title: 'Mejoras sobre sistemas existentes',
    description:
      'Modernizamos, reestructuramos o rediseñamos software antiguo sin perder lo que ya funciona. Evolucionamos lo que ya tienes.'
  }
]

function SolutionsMovingCards() {
  return (
    <section>
      <InfiniteMovingCards
        className="my-0"
        speed="slow"
        direction="right"
        items={items_a}
      />
      <InfiniteMovingCards speed="slow" direction="left" items={items_b} />
      <InfiniteMovingCards speed="slow" direction="right" items={items_c} />
    </section>
  )
}

export default SolutionsMovingCards
