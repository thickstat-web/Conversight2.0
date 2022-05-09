import { AUTH_REDUCER } from '@/Constants/redux'
import { createSlice } from '@reduxjs/toolkit'

type Org = {
  orgId: string
  name: string
}

interface authState {
  email: string
  allOrganizations: any[]
  selectedOrg: Org
}

const initialState = {
  email: '',
  allOrganizations: [],
  selectedOrg: { name: '', orgId: '' },
} as authState

const authSlice = createSlice({
  name: AUTH_REDUCER,
  initialState,
  reducers: {
    setEmail: (state, { payload }) => {
      state.email = payload
    },
    setAllOrganizations: (state, { payload }) => {
      state.allOrganizations = [...payload]
    },
    setSelectedOrg: (state, { payload }) => {
      state.selectedOrg = { ...payload }
    },
  },
})

export const { setEmail, setAllOrganizations, setSelectedOrg } = authSlice.actions

export default authSlice.reducer
