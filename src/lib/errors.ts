import { CUSTOMER_RESPONSE_HEADERS } from './constants'

export class BadResponseError extends Error {
  status: number
  emailSent: boolean

  constructor(res: Response) {
    super(
      res.headers.get(CUSTOMER_RESPONSE_HEADERS.ERROR) ?? 'Respuesta inesperada'
    )
    this.name = 'BadResponseError'
    this.status = res.status
    this.emailSent = res.headers.has(CUSTOMER_RESPONSE_HEADERS.EMAIL_SENT)
  }
}
