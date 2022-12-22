export interface Navigation { }

export interface Params { }

export interface Route {
  key: string
  name: string
  params: Params
}

export interface NavigationProps {
  navigation: Navigation
  route: Route
}

export interface ResponseType<T> {
  success: boolean
  error?: string | null
  data?: T
}

export interface FCMTokenResponse {
  code: number
  message: string
}

export interface Error {
  code?: number
  message: string
}

export interface LogoutResponse {
  status?: number
  message: string
}

export type FollowupType = 'ConverseData' | 'WebURL'

export interface URLFollowupData {
  id: string
  explorerURL: string
  thumbnailURL: string
}
