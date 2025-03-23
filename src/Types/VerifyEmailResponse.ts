export interface Domain {
  ingressName: string
  domainURL: string
  status: boolean
  domainName: string
  isAdded?: boolean
  error: string
}

export interface ApiConfig {
  apiServerHost: string
  betaHost: string
  botArrowServerHost: string
  botServerHost: string
  dataManager: string
  ingressServerHost: string
  kbnet: string
  syncJob: string
}

export interface OrgData {
  orgId: string
  domain: Domain[]
  email: string
  userId: string
  name: string
  accessList: string[]
  apiConfig: ApiConfig
  isCasdoorOrg: boolean
}

type ResponseCode = 200 | 401

interface ErrorMessage {
  message: string
}

export interface VerifyEmailResponse {
  code: ResponseCode
  errors: ErrorMessage[]
  orgData: OrgData[]
}

export interface Org {
  orgId: string
  name: string
}
