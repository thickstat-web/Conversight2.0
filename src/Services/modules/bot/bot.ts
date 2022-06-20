import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { ResponseType } from '@/Types/Common'
import {
  ChatHistoryRequestData,
  ChatHistoryResponse,
} from '@/Types/ChatHistory'
import { RawChatMessage } from '@/Types/ChatMessage'

export const getChatHistory = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<
    ResponseType<RawChatMessage[]>,
    Partial<ChatHistoryRequestData>
  >({
    query: body => ({
      url: '/history',
      method: 'POST',
      body,
    }),
    transformResponse: async (response: ChatHistoryResponse) => {
      const { status: respStatus, data = [] } = response
      const sortedMessages = data
        .map(item => {
          const {
            columns,
            column_metadata,
            colType,
            createdAt,
            val,
            ID,
            displayUtterance,
            text,
            utterance,
            status,
          } = item
          return {
            columns,
            columnMetadata: column_metadata,
            colType,
            createdAt,
            base64Data: val,
            id: ID,
            displayUtterance,
            text,
            utterance,
            status,
          }
        })
        .sort(
          (a: RawChatMessage, b: RawChatMessage) => a.createdAt - b.createdAt,
        )
      return { success: respStatus, data: sortedMessages }
    },
  })
}
