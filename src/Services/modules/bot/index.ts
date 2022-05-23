import { botApi } from '../../api'
import { getChatHistory } from './bot'

export const botApiSlice = botApi.injectEndpoints({
  endpoints: build => ({
    getChatHistory: getChatHistory(build),
  }),
  overrideExisting: false,
})

export const { useGetChatHistoryMutation } = botApiSlice
