import { AUTH_REDUCER } from '@/Constants/redux'
import { createSlice } from '@reduxjs/toolkit'
import { SignInResponseData } from '@/Types/SignInResponse'
import { RootState } from '..'

type Org = {
  orgId: string
  name: string
}

interface AuthState {
  email: string
  organizations: any[]
  signInOrg: Org
  authData: SignInResponseData
}

const initialState: AuthState = {
  email: '',
  organizations: [],
  signInOrg: { name: '', orgId: '' },
  authData: {},
}

const authSlice = createSlice({
  name: AUTH_REDUCER,
  initialState,
  reducers: {
    setSignInEmail: (state, { payload }) => {
      state.email = payload
    },
    setAllOrganizations: (state, { payload }) => {
      state.organizations = [...payload]
    },
    setSelectedOrg: (state, { payload }) => {
      state.signInOrg = { ...payload }
    },
    setAuthData: (state, { payload }) => {
      state.authData = payload
    },
  },
})

export const selectSignInEmail = (state: RootState) => state.authReducer.email
export const selectAllOrganizations = (state: RootState) =>
  state.authReducer.organizations
export const selectSignInOrg = (state: RootState) => state.authReducer.signInOrg
export const selectAuthData = (state: RootState) => state.authReducer.authData

export const {
  setSignInEmail,
  setAllOrganizations,
  setSelectedOrg,
  setAuthData,
} = authSlice.actions

export default authSlice.reducer
