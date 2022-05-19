export interface Preference {
  sound_cues: boolean
  voice_speed: string
  allow_athena: boolean
  provide_suggestion: boolean
  save_conversation: boolean
}

export interface MyProfile {
  fName: string
  id: string
  lname: string
  role: string
  mobileNum: string
  designation: string
  email: string
  displayName: string
  chatPageDisabled: boolean
  orgId: string
  preference: Preference
}

export interface Data {
  myProfile: MyProfile[]
}

export interface SettingsResponseData {
  status: string
  data: Data[]
}
