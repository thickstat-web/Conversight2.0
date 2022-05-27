import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { ResponseTypeFAQ } from '@/Types/Common'
import { FaqRequestData } from '@/Types/FaqRequest'
import { FaqResponseData } from '@/Types/FaqResponse'

export const getFaq = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<ResponseTypeFAQ, Partial<FaqRequestData>>({
    query: body => ({
      url: `/faq?token=${body.token}`,
      method: 'POST',
      body,
    }),
    transformResponse: (response: FaqResponseData) => {
      const { data, status } = response
      let FaqResponseData = { status: 'fail' } as FaqResponseData
      if (status === 'ok') {
        FaqResponseData = { status: 'ok', data }
      }else{
        FaqResponseData = {
            status: 'fail',
            data: {},
            error: 'Unable to fetch FAQ, try again later',
        }
      }

      return FaqResponseData
    },
  })
}
