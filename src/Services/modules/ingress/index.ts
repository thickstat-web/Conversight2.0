import { ingressApi } from '../../api'
import { fetchConverseData, sendChatMessage } from './ingress'

export const ingressApiSlice = ingressApi.injectEndpoints({
  endpoints: build => ({
    sendChatMessage: sendChatMessage(build),
    converseResponse: fetchConverseData(build)
  }),
  overrideExisting: false,
})

export const { useSendChatMessageMutation } = ingressApiSlice
