import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { ResponseType } from '@/Types/Common'
import {
  ChatHistoryRequestData,
  ChatHistoryResponse,
  ChatMessage,
} from '@/Types/ChatHistory'

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
    transformResponse: (response: ChatHistoryResponse) => {
      const { status, data = [] } = response
      const sortedMessages = data.sort(
        (a: ChatMessage, b: ChatMessage) => a.createdAt - b.createdAt,
      )
      return { success: status, data: sortedMessages }
    },
  })
}
