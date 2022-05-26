export interface ResponseType {
  success: boolean
  error?: string | null
  data?: any
}

export interface Error {
  code?: number
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