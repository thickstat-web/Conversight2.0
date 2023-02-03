import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { getIngressUrl } from '@/Config'
import { ResponseType } from '@/Types/Common'
import {
  Data,
  SendChatMessage,
  SendChatMessageResponse,
} from '@/Types/SendChatMessage'
import {
  AthenaResponse,
  AthenaResponseType,
  Clarification,
  RawConverseData,
} from '@/Types/ChatMessage'
import { buildOrderedColumns } from '@/Utils/common'

const makeConverseData = (data: Data) => {
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

  const rawConverseData: RawConverseData = {
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
  return rawConverseData
}

const makeClarificationData = (data: Data) => {
  const { clarify, text } = data

  const clarification: Clarification = {
    title: text,
    suggestions: clarify.map(item => item.text),
  }
  return clarification
}

export const sendChatMessage = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<ResponseType<AthenaResponse>, Partial<SendChatMessage>>(
    {
      query: body => ({
        url: `${getIngressUrl()}/converse/v2`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: SendChatMessageResponse) => {
        const {
          status: respStatus,
          response: { data, text },
        } = response

        let result: AthenaResponse = {
          type: AthenaResponseType.ATHENA_ERROR,
          error: text,
        }

        if (respStatus !== 'failed') {
          result = {
            type:
              respStatus === 'clarification'
                ? AthenaResponseType.CLARIFICATION
                : AthenaResponseType.CONVERSE,
            data:
              respStatus === 'clarification'
                ? makeClarificationData(data)
                : makeConverseData(data),
          }
        }

        return {
          success: ['ok', 'clarification'].includes(respStatus),
          data: result,
        }
      },
    },
  )
}
