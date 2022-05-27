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

export interface ResponseTypeSettings {
  status?: string
  data?: any
  error?: string
}

export interface ResponseTypeFAQ {
  status?: string
  data?: any
  error?: string
}
