import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '..'
import { SETTING_REDUCER } from '@/Constants/redux'
import { Preference, MyProfile } from '@/Types/SettingsResponse'

const preferenceInitialState: Preference = {
  sound_cues: false,
  voice_speed: '',
  allow_athena: true,
  provide_suggestion: true,
  save_conversation: true,
}

const initialState: MyProfile = {
  fName: '',
  id: '',
  lname: '',
  role: '',
  mobileNum: '',
  designation: '',
  email: '',
  displayName: '',
  chatPageDisabled: false,
  orgId: '',
  preference: preferenceInitialState,
}

const settingsSlice = createSlice({
  name: SETTING_REDUCER,
  initialState: initialState,
  reducers: {
    setProfileSettings: (state, { payload }) => {
      Object.assign(state, payload)
    },
  },
})

export const selectProfile = (state: RootState) => state.settingsReducer
export const selectPreference = (state: RootState) =>
  state.settingsReducer.preference

export const { setProfileSettings } = settingsSlice.actions

export default settingsSlice.reducer
