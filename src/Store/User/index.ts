import { createSlice } from '@reduxjs/toolkit'
import { USER_REDUCER } from '@/Constants/redux'
import { RootState } from '..'



export interface UserProfile {
  data: UserProfileData
  success: boolean
}

export interface UserProfileData {
  chatPageDisabled: any
  designation: string
  displayName: string
  email: string
  fName: string
  id: string
  lname: string
  mobileNum: string
  orgId: string
  preference: Preference
  role: string
}

export interface Preference {
  allow_athena: any
  provide_suggestion: any
  save_conversation: any
  sound_cues: any
  voice_speed: any
}

const initialState: UserProfile = {
  data: {
    chatPageDisabled: null,
    designation: "",
    displayName: "",
    email: "",
    fName: "",
    id: "",
    lname: "",
    mobileNum: "",
    orgId: "",
    preference: {
      allow_athena: null,
      provide_suggestion: null,
      save_conversation: null,
      sound_cues: null,
      voice_speed: null,
    },
    role: "",
  },
  success: false,
};

const userSlice = createSlice({
  name: USER_REDUCER,
  initialState,
  reducers: {
    setUserProfile: (state, { payload }) => {
      state.data = payload.data
      state.success=payload.success
    }
  },
})



export const selectUserProfile= (state: RootState) => state.userReducer.data


export const {
setUserProfile
} = userSlice.actions

export default userSlice.reducer
