import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { CS_API_HOST, getAPIUrl } from '@/Config'
import { FCMTokenResponse, LogoutResponse, ResponseType } from '@/Types/Common'
import { OrgData, NewVerifyEmailResponse } from '@/Types/VerifyEmailResponse'
import { SignInRequestData } from '@/Types/SignInRequest'
import { AuthData, SignInResponseData } from '@/Types/SignInResponse'
import {
  ForgotPasswordRequestData,
  ForgotPasswordResponse,
} from '@/Types/ForgotPassword'
import { CLIENT_DATA } from '@/Config'
import { bridgeOrgData } from '@/Utils/orgBridge'

export const verifyEmail = (build: EndpointBuilder<any, any, any>) => {
  const { client_id, client_secret } = CLIENT_DATA
  return build.query<ResponseType<OrgData[]>, string>({
    query: email => ({
      url: `https://${CS_API_HOST}/api/v1/v2/userOrg?email=${email}`,
      headers: {
        'client-id': client_id,
        'client-secret': client_secret,
      },
    }),
    transformResponse: (response: NewVerifyEmailResponse) => {
      const { code, errors, orgData = [] } = response
      const isSuccess = code === 200
      const error = !isSuccess && errors?.length > 0 ? errors[0].message : ''
      const bridgedOrgData = bridgeOrgData(orgData)
      const sortHandler = (a: OrgData, b: OrgData) =>
        a.name.localeCompare(b.name)
      const sortedOrgData = bridgedOrgData.sort(sortHandler)
      return { success: isSuccess, error, data: sortedOrgData }
    },
  })
}

export const signIn = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<ResponseType<AuthData>, Partial<SignInRequestData>>({
    query: body => ({
      url: `${getAPIUrl()}/api/v1/authenticate`,
      method: 'POST',
      body,
    }),
    transformResponse: (response: SignInResponseData) => {
      const { data, errors } = response
      let signInResp = { success: false } as ResponseType<AuthData>
      if (data?.authentication === 'success') {
        signInResp = { success: true, data }
      } else if (errors?.length) {
        const error =
          errors[0].message ||
          'Unable to sign in your account right now. Please try again later'
        signInResp = { success: false, error }
      }
      return signInResp
    },
  })
}

export const sendFCMToken = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<ResponseType<string>, string>({
    query: token => ({
      url: `${getAPIUrl()}/api/v1/userDeviceToken`,
      method: 'POST',
      body: { deviceToken: token },
    }),
    transformResponse: (response: FCMTokenResponse) => {
      if (typeof response === 'string') {
        return { success: false, error: response }
      } else {
        const { code, message } = response
        let sendTokenResp = { success: false } as ResponseType<string>
        if (code === 200 && message === 'success') {
          sendTokenResp = { success: true, data: message }
        } else {
          sendTokenResp = { success: false, error: message }
        }
        return sendTokenResp
      }
    },
  })
}

export const logout = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<string>, void>({
    query: () => `${getAPIUrl()}/api/v1/logout`,
    transformResponse: (response: LogoutResponse) => {
      const { status, message } = response
      return { success: status === 200, data: message }
    },
  })
}

export const forgotPassword = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<
    ResponseType<string>,
    Partial<ForgotPasswordRequestData>
  >({
    query: body => ({
      url: `${getAPIUrl()}/api/v1/forgotpass`,
      method: 'POST',
      body,
    }),
    transformResponse: (response: ForgotPasswordResponse) => {
      return { success: true, data: response.message }
    },
  })
}
