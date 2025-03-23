import { createSlice } from '@reduxjs/toolkit'
import { HOST_REDUCER } from '@/Constants/redux'
import { HostUrl } from '@/Types/SignInResponse'
import { RootState } from '..'

const initialState: HostUrl = {
    aiWorkBench: '',
    analyticsHost: '',
    apiServerHost: '',
    authenticatorHost: '',
    betaHost: '',
    betaUI: '',
    botArrowServerHost: '',
    botServerHost: '',
    dataManager: '',
    hostV1: '',
    ingressServerHost: '',
    kbnet: '',
    syncJob: '',
    zendeskLink: ''
}


const hostSlice = createSlice({
    name: HOST_REDUCER,
    initialState,
    reducers: {
        setCustomHost: (state, { payload }) => {
            state.apiServerHost = payload.apiServerHost,
            state.botServerHost = payload.botServerHost,
            state.ingressServerHost = payload.ingressServerHost
        },
        cleanupHostData: (state) => {
            Object.assign(state, initialState)
        }
    },
})

export const selectCustomHost = (state: RootState) => state.hostReducer


export const {
    setCustomHost,
    cleanupHostData
} = hostSlice.actions

export default hostSlice.reducer