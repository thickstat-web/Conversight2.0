export interface ResponseType {
  success: boolean
  error?: string | null
  data?: any
}

export interface Error {
  code?: number
  message: string
}
