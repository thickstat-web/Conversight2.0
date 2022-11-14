import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { getIngressUrl } from '@/Config'
import { ResponseType } from '@/Types/Common'
import {
  SendChatMessage,
  SendChatMessageResponse,
} from '@/Types/SendChatMessage'
import { RawConverseData } from '@/Types/ChatMessage'
import { buildOrderedColumns } from '@/Utils/common'

export const sendChatMessage = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<
    ResponseType<RawConverseData>,
    Partial<SendChatMessage>
  >({
    query: body => ({
      url: `${getIngressUrl()}/converse/v2`,
      method: 'POST',
      body,
    }),
    transformResponse: (response: SendChatMessageResponse) => {
      const {
        status: respStatus,
        response: { data },
      } = response

      if (respStatus === 'failed') {
        return {
          success: false,
        }
      }

      const {
        columns,
        column_metadata,
        colType,
        createdAt,
        val,
        id,
        isColumnReorder,
        // processedUtterance,
        text,
        utterance,
        status,
      } = data
      let transformedData = {
        columns,
        orderedColumns: buildOrderedColumns(isColumnReorder, colType, columns),
        columnMetadata: column_metadata,
        colType,
        createdAt,
        base64Data: val,
        id,
        text,
        utterance,
        status,
      }
      return {
        success: ['ok'].includes(respStatus), // , 'clarification'
        data: transformedData,
      }
    },
  })
}
