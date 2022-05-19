import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '..'
import { SETTING_REDUCER } from '@/Constants/redux'
import { SettingsResponseData } from '@/Types/SettingsResponse'
import { Preference, MyProfile } from '@/Types/SettingsResponse'

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
  preference: {
    sound_cues: false,
    voice_speed: '',
    allow_athena: true,
    provide_suggestion: true,
    save_conversation: true,
  },
}

const settingsSlice = createSlice({
  name: SETTING_REDUCER,
  initialState: initialState,
  reducers: {
    setCurrentSettings: (state, { payload }) => {
      const {
        fName,
        email,
        displayName,
        mobileNum,
        role,
        preference,
        lname,
        chatPageDisabled,
        designation,
        id,
        orgId,
      } = payload.myProfile[0] as MyProfile
      state.fName = fName
      state.email = email
      state.displayName = displayName
      state.mobileNum = mobileNum
      state.role = role
      state.preference = preference
      state.lname = lname
      state.chatPageDisabled = chatPageDisabled
      state.designation = designation
      state.id = id
      state.orgId = orgId
    },
  },
})

export const { setCurrentSettings } = settingsSlice.actions

export default settingsSlice.reducer
