import { createSlice } from '@reduxjs/toolkit'
import { DEFAULT_PASSWORD } from '@/Config'
import { AUTH_REDUCER } from '@/Constants/redux'
import { AuthData } from '@/Types/SignInResponse'
import { Org, OrgData } from '@/Types/VerifyEmailResponse'
import { RootState } from '..'


interface AuthState {
  email: string
  password: string
  fcmToken: string | null
  organizations: OrgData[]
  signInOrg: Org | null
  authData: AuthData | null
  selectedDatasetId: string | null
  selectedOrg: Org
  tempOrg: Org
}

const initialState: AuthState = {
  email: '',
  fcmToken: null,
  password: DEFAULT_PASSWORD,
  organizations: [],
  signInOrg: null,
  authData: null,
  selectedDatasetId: null,
  selectedOrg: { name: '', orgId: '' },
  tempOrg: { name: '', orgId: '' },
}

const authSlice = createSlice({
  name: AUTH_REDUCER,
  initialState,
  reducers: {
    setSignInEmail: (state, { payload }) => {
      state.email = payload
    },
    setFCMToken: (state, { payload }) => {
      state.fcmToken = payload
    },
    setAllOrganizations: (state, { payload }) => {
      state.organizations = [...payload]
    },
    setSelectedOrg: (state, { payload }) => {
      state.signInOrg = { ...payload }
      state.selectedOrg = { ...payload }
    },
    setAuthData: (state, { payload }) => {
      state.authData = payload
    },
    setSelectedDatasetId: (state, { payload }) => {
      state.selectedDatasetId = payload
    },
    cleanupAuthData: state => {
      Object.assign(state, initialState)
    },
    setTempOrg: (state, { payload }) => {
      state.tempOrg = { ...payload }
    },
    setPassword: (state, { payload }) => {
      state.password = payload
    },
  },
})

export const selectSignInEmail = (state: RootState) => state.authReducer.email
export const selectFCMToken = (state: RootState) => state.authReducer.fcmToken

export const selectAllOrganizations = (state: RootState) =>
  state.authReducer.organizations

export const selectSignInOrg = (state: RootState) => state.authReducer.signInOrg

export const selectSelectedOrg = (state: RootState) =>
  state.authReducer.selectedOrg

export const selectAuthData = (state: RootState) => state.authReducer.authData

export const selectDatasetId = (state: RootState) =>
  state.authReducer.selectedDatasetId

export const selectTempOrg = (state: RootState) => state.authReducer.tempOrg

export const selectPassword = (state: RootState) => state.authReducer.password

export const {
  setSignInEmail,
  setFCMToken,
  setAllOrganizations,
  setSelectedOrg,
  setAuthData,
  setSelectedDatasetId,
  cleanupAuthData,
  setTempOrg,
  setPassword,
} = authSlice.actions

export default authSlice.reducer
