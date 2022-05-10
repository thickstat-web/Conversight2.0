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
  allOrganizations: any[]
  selectedOrg: Org
  authData: SignInResponseData
}

const initialState: AuthState = {
  email: '',
  allOrganizations: [],
  selectedOrg: { name: '', orgId: '' },
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
      state.allOrganizations = [...payload]
    },
    setSelectedOrg: (state, { payload }) => {
      state.selectedOrg = { ...payload }
    },
    setAuthData: (state, { payload }) => {
      state.authData = payload
    },
  },
})

export const selectSignInEmail = (state: RootState) => state.authReducer.email
export const selectAllOrganizations = (state: RootState) =>
  state.authReducer.allOrganizations
export const selectSelectedOrg = (state: RootState) =>
  state.authReducer.selectedOrg
export const selectAuthData = (state: RootState) => state.authReducer.authData

export const {
  setSignInEmail,
  setAllOrganizations,
  setSelectedOrg,
  setAuthData,
} = authSlice.actions

export default authSlice.reducer
