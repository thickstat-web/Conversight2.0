import { createSlice } from '@reduxjs/toolkit'
import { AUTH_REDUCER } from '@/Constants/redux'
import { AuthData } from '@/Types/SignInResponse'
import { RootState } from '..'

type Org = {
  orgId: string
  name: string
}

interface AuthState {
  email: string
  organizations: any[]
  signInOrg: Org | null
  authData: AuthData | null
  selectedDatasetId: string | null
}

const initialState: AuthState = {
  email: '',
  organizations: [],
  signInOrg: null,
  authData: null,
  selectedDatasetId: null,
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
    setSelectedDatasetId: (state, { payload }) => {
      state.selectedDatasetId = payload
    },
    cleanupAuthData: state => {
      Object.assign(state, initialState)
    },
  },
})

export const selectSignInEmail = (state: RootState) => state.authReducer.email
export const selectAllOrganizations = (state: RootState) =>
  state.authReducer.organizations
export const selectSignInOrg = (state: RootState) => state.authReducer.signInOrg
export const selectAuthData = (state: RootState) => state.authReducer.authData
export const selectDatasetId = (state: RootState) =>
  state.authReducer.selectedDatasetId

export const {
  setSignInEmail,
  setAllOrganizations,
  setSelectedOrg,
  setAuthData,
  setSelectedDatasetId,
  cleanupAuthData,
} = authSlice.actions

export default authSlice.reducer
