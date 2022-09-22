import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { getAPIUrl } from '@/Config'
import { ResponseType } from '@/Types/Common'
import { SettingsResponseData, MyProfile } from '@/Types/SettingsResponse'
import { SettingsRequestData } from '@/Types/SettingsRequest'

export const getSettings = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<ResponseType<MyProfile>, Partial<SettingsRequestData>>({
    query: body => ({
      url: `${getAPIUrl()}/api/v1`,
      method: 'POST',
      body,
    }),
    transformResponse: (response: SettingsResponseData) => {
      const {
        data: { myProfile },
        status,
      } = response
      let profileSettings: ResponseType<MyProfile> = {
        success: false,
        error: 'Unable to fetch Settings, try again later',
      }
      if (
        status === 'success' &&
        Array.isArray(myProfile) &&
        myProfile.length > 0
      ) {
        profileSettings = { success: true, data: myProfile[0] }
      }
      return profileSettings
    },
  })
}
