import { ingressApi } from '../../api'
import { fetchConverseData, sendChatMessage, fetchConverseDataV2 } from './ingress'

export const ingressApiSlice = ingressApi.injectEndpoints({
  endpoints: build => ({
    sendChatMessage: sendChatMessage(build),
    converseResponse: fetchConverseData(build),
    converseResponseV2: fetchConverseDataV2(build)
  }),
  overrideExisting: false,
})

export const { useSendChatMessageMutation, useConverseResponseMutation, useConverseResponseV2Mutation } = ingressApiSlice
