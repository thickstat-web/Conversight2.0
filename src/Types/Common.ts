export interface ResponseType<T> {
  success: boolean
  error?: string | null
  data?: T
}

export interface Error {
  code?: number
  message: string
}

export interface LogoutResponse {
  status?: number
  message: string
}
