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
  tempOrg: Org
}

const initialState: AuthState = {
  email: '',
  allOrganizations: [],
  selectedOrg: { name: '', orgId: '' },
  authData: {},
  tempOrg: { name: '', orgId: '' },
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
    setTempOrg: (state, { payload }) => {
      state.tempOrg = { ...payload }
    },
  },
})

export const selectSignInEmail = (state: RootState) => state.authReducer.email

export const selectAllOrganizations = (state: RootState) =>
  state.authReducer.allOrganizations

export const selectSelectedOrg = (state: RootState) =>
  state.authReducer.selectedOrg

export const selectAuthData = (state: RootState) => state.authReducer.authData

export const selectTempOrg = (state: RootState) => state.authReducer.tempOrg

export const {
  setSignInEmail,
  setAllOrganizations,
  setSelectedOrg,
  setAuthData,
  setTempOrg,
} = authSlice.actions

export default authSlice.reducer
