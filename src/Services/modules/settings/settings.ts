import { ResponseTypeSettings } from '@/Types/Common'
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { SettingsResponseData } from '@/Types/SettingsResponse'
import { SettingsRequestData } from '@/Types/SettingsRequest'

export const getSettings = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<ResponseTypeSettings, Partial<SettingsRequestData>>({
      query: body => ({
          url: `?token=${body.token}`,
          method: 'POST',
          body,
        }),
        transformResponse: (response: SettingsResponseData) => {
            const { data, status } = response
            let settingsResponseData = { status: 'fail' } as ResponseTypeSettings
            if (status === 'success') {
                settingsResponseData = { status: 'success', data }
            } else {
                settingsResponseData = {
                    status: 'fail',
                    data: {},
                    error: 'Unable to fetch Settings, try again later',
                }
            }

      return settingsResponseData
    },
  })
}
