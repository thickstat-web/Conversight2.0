import {
  AthenaResponse,
  AthenaResponseType,
  Clarification,
  RawConverseData,
  Rerequest,
} from '@/Types/ChatMessage'
import {
  Data,
  SendChatMessage,
  SendChatMessageResponse,
} from '@/Types/SendChatMessage'

import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { ResponseType } from '@/Types/Common'
import { buildOrderedColumns } from '@/Utils/common'
import { getIngressUrl } from '@/Config'
import { setConverseResponse } from '@/Store/Converse'
import { atob } from 'react-native-quick-base64'

const makeConverseData = (data: Data): AthenaResponse => {
  const {
    columns,
    column_metadata,
    colType,
    createdAt,
    val,
    id,
    isColumnReorder,
    followup_questions,
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
    followupQuestions: followup_questions,
    base64Data: val,
    id,
    text,
    utterance,
    status,
  }
  return { type: AthenaResponseType.CONVERSE, data: rawConverseData }
}

const makeClarificationData = (data: Data): AthenaResponse => {
  const { id, clarify, text } = data

  const clarification: Clarification = {
    id,
    title: text,
    suggestions: clarify.map(item => item.text),
  }
  return { type: AthenaResponseType.CLARIFICATION, data: clarification }
}

const makeRerequestData = (data: Data, question: string): AthenaResponse => {
  const { id, text } = data
  const rerequest: Rerequest = {
    id,
    title: text,
    question,
  }
  return { type: AthenaResponseType.REREQUEST, data: rerequest }
}

export const sendChatMessage = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<ResponseType<AthenaResponse>, Partial<SendChatMessage>>(
    {
      query: (body: Partial<SendChatMessage>) => ({
        url: `${getIngressUrl()}/converse/v2`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: SendChatMessageResponse) => {
        const {
          status,
          response: { data, text, additional_data },
        } = response

        const additionalData =
          status === 'failed' ? additional_data : data.additional_data

        let result: AthenaResponse = {
          type: AthenaResponseType.ATHENA_ERROR,
          error: text,
        }

        switch (status) {
          case 'ok':
            result = makeConverseData(data)
            break
          case 'clarification':
            if (additionalData?.sub_type === 'clarify') {
              result = makeClarificationData(data)
            } else if (additionalData?.sub_type === 're-request') {
              const {
                reRequest: { question },
              } = additionalData

              result = makeRerequestData(data, question)
            }
            break
          // case 'error':
          //   result.error = text
          //   break
          // default:
          //   result.error = `Unhandled response status: ${status}`
          //   break
        }

        return {
          success: ['ok', 'clarification'].includes(status),
          data: result,
        }
      },
    },
  )
}

export const fetchConverseData = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<
    { data: any },
    Partial<SendChatMessage>
  >({
    query: (body) => ({
      url: `${getIngressUrl()}/converse/v2`,
      method: 'POST',
      body,
    }),

    transformResponse: (response: any) => {
      console.log('redux response is ',response)
      return {
        data: JSON.parse(atob(response?.instructions[0]?.data?.response?.converse?.response?.data?.val)) , 
      };
    },

    async onQueryStarted(converseId, { dispatch, queryFulfilled }) {
      try {
        const { data } = await queryFulfilled;
        const converseId = 'default';
        dispatch(setConverseResponse({ converseId, response: data.data }));
      } catch (err) {
      }
    },
  });
};


