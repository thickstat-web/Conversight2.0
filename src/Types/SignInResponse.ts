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

export interface Data {
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
}

export interface SignInResponseData {
  displayName: string
  data?: Data
  errors?: Error[]
}
