import { processChatHistory } from './transform-helper'
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { ResponseType } from '@/Types/Common'
import {
  ChatHistoryRequestData,
  ChatHistoryResponse,
  Message,
} from '@/Types/ChatHistory'
import { ChatMessage } from '@/Types/ChatMessage'

export const getChatHistory = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<
    ResponseType<ChatMessage[]>,
    Partial<ChatHistoryRequestData>
  >({
    query: body => ({
      url: '/history',
      method: 'POST',
      body,
    }),
    transformResponse: async (response: ChatHistoryResponse) => {
      const { status, data = [] } = response
      const sortedMessages = data.sort(
        (a: Message, b: Message) => a.createdAt - b.createdAt,
      )
      const messages = await processChatHistory(sortedMessages)
      return { success: status, data: messages }
    },
  })
}
