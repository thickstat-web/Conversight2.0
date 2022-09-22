import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { getBotUrl } from '@/Config'
import { ResponseType } from '@/Types/Common'
import { FaqRequestData, FaqResponseData } from '@/Types/Faq'

export const getFaq = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<ResponseType<string[]>, Partial<FaqRequestData>>({
    query: body => ({
      url: `${getBotUrl()}/faq`,
      method: 'POST',
      body,
    }),
    transformResponse: (response: FaqResponseData) => {
      const { data, status } = response
      if (status === 'ok') {
        return { success: true, data }
      } else {
        return {
          success: false,
          data: [],
          error: 'Unable to fetch FAQ, try again later',
        }
      }
    },
  })
}
