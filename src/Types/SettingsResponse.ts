export interface Preference {
  allow_athena?: boolean
  provide_suggestion?: boolean
  save_conversation?: boolean
  sound_cues?: boolean
  voice_speed?: string
}

export interface MyProfile {
  chatPageDisabled?: boolean
  designation?: string
  displayName?: string
  email?: string
  fName?: string
  id?: string
  lname?: string
  mobileNum?: string
  orgId?: string
  preference?: Preference
  role?: string
}

export interface Data {
  myProfile: MyProfile[]
}

export interface SettingsResponseData {
  status: string
  data: Data
}
