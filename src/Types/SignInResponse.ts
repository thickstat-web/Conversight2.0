import { Error } from './Common'

export interface TrialSettings {
  expiresAt: string
  fileUploadSizeLimit: string
}

export interface Notebook {
  enabled: boolean
  typeID: any[]
}

export interface Access {
  notebook: Notebook
  chatPageDisabled: boolean
  showApps: boolean
  showTower: boolean
}

export interface AuthData {
  authentication?: 'success'
  token?: string
  uid?: string
  orgId?: string
  displayName?: string
  role?: string
  accessList?: string[]
  isFirstTimeLogin?: boolean
  athenaId?: string
  isTrialUser?: boolean
  trialSetting?: TrialSettings
  allowTrialAccess?: boolean
  access?: Access
  isCasdoorOrg?:boolean
}

export interface SignInResponseData {
  data?: AuthData
  errors?: Error[]
}

export interface ConfigResponse {
  apiGateway: ApiGateway
  backgroundURL: string
  devMode: boolean
  domain: string
  env: string
  guideLinks: GuideLinks
  notifiySlackChannel: boolean
  port: number
  segment: Segment
  specialColumnsList: string[]
  zendeskLink: string
}

export interface ApiGateway {
  default: HostUrl
}

export interface HostUrl {
  aiWorkBench: string
  analyticsHost: string
  apiServerHost: string
  authenticatorHost: string
  betaHost: string
  betaUI: string
  botArrowServerHost: string
  botServerHost: string
  dataManager: string
  hostV1: string
  ingressServerHost: string
  kbnet: string
  syncJob: string
  zendeskLink: string
}

export interface GuideLinks {
  academyGuide: AcademyGuide
  adminGuide: AdminGuide
}

export interface AcademyGuide {
  icon: string
  navigatePath: string
}

export interface AdminGuide {
  navigatePath: string
}

export interface Segment {
  debug: boolean
  key: string
  userActivityRecording: boolean
}
