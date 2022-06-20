import { ingressApi } from '../../api'
import { sendChatMessage } from './ingress'

export const ingressApiSlice = ingressApi.injectEndpoints({
  endpoints: build => ({
    sendChatMessage: sendChatMessage(build),
  }),
  overrideExisting: false,
})

export const { useSendChatMessageMutation } = ingressApiSlice
