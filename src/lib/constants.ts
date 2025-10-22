export const ROLES = {
  ADMIN: 1,
  DEV: 2,
  CLIENT: 3
}

export const ORDER_STATUSES = [
  'Desconocido',
  'En planificación',
  'Pago requerido',
  'En desarrollo',
  'En producción',
  'En mantenimiento',
  'Revisión del cliente',
  'En espera',
  'Archivado',
  'Cancelado',
  'Completado'
]

export const THREAD_TYPES = [
  'Desconocido',
  'Soporte técnico',
  'Nueva funcionalidad',
  'Nueva iniciativa',
  'Consulta rápida',
  'Planificación',
  'Pagos y Facturación',
  'Revisión / Feedback',
  'Acceso y configuración',
  'Administrativo / Legal',
  'Otro'
]

export const THREAD_STATUSES = [
  'Desconocido',
  'Abierto',
  'Archivado',
  'Cerrado'
]

export const THREAD_STATUSES_KEYS = {
  OPEN: 1,
  ARCHIVED: 2,
  CLOSED: 3
}

export const THREAD_TYPES_KEYS = {
  TECHNICAL_SUPPORT: 1,
  FEATURE_REQUEST: 2,
  NEW_INITIATIVE: 3,
  QUICK_HELP: 4,
  PLANNING: 5,
  PAYMENT_AND_INVOICE: 6,
  REVIEW_AND_FEEDBACK: 7,
  ACCESS_AND_CONFIGURATION: 8,
  ADMINISTRATIVE_AND_LEGAL: 9,
  OTHER: 10
}

export const ORDER_STATUSES_KEYS = {
  PLANNING: 1,
  PAYMENT_REQUIRED: 2,
  DEVELOPMENT: 3,
  PRODUCTION: 4,
  MAINTENANCE: 5,
  CLIENT_REVIEW: 6,
  ON_HOLD: 7,
  ARCHIVED: 8,
  CANCELLED: 9,
  COMPLETED: 10
}

export const MAX_ITEMS_PER_PAGE = 30

export const ITEM_TYPES = [
  'Desconocido',
  'SaaS',
  'Administración de sistema y componentes',
  'Administración de aplicaciones',
  'Desarrollo de aplicaciones web',
  'Desarrollo de aplicaciones servidor',
  'Planificación de sistemas',
  'Arquitectura de sistemas',
  'Diseño de bases de datos',
  'Diseño de sitios web y UX',
  'Ingeniería',
  'Implementación y despliegue de aplicaciones',
  'Desarrollo de software personalizado (No-Web)',
  'Implementación de funcionalidades del sistema',
  'Mantenimiento de software',
  'Soporte técnico y asistencia',
  'Actualización de software',
  'Soporte técnico y asistencia',
  'Análisis de sistemas',
  'Análisis de bases de datos',
  'Diseño de aplicaciones PC',
  'Diseño de integración de sistemas',
  'Desarrollo de software',
  'Administración de información del sistema MIS',
  'Investigación y desarrollo temporal',
  'Investigación y desarrollo de productos',
  'Investigación y desarrollo de aplicaciones',
  'Mantenimiento de software de desarrollo',
  'Patente, marca de comercio y derechos de autor'
]

export const CUSTOMER_RESPONSE_HEADERS = {
  ERROR: 'Works-Error-Message',
  MESSAGE: 'Works-Message',
  EMAIL_SENT: 'Works-Email-Sent'
}

export const GOAL_TYPES: { [key: string]: string } = {
  feature: 'Funcionalidad',
  technology: 'Tecnología',
  technical_restriction: 'Restricción técnica'
}
