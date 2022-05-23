import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { LogoutResponse, ResponseType } from '@/Types/Common'
import { OrgData, VerifyEmailResponse } from '@/Types/VerifyEmailResponse'
import { SignInRequestData } from '@/Types/SignInRequest'
import { AuthData, SignInResponseData } from '@/Types/SignInResponse'
import {
  ForgotPasswordRequestData,
  ForgotPasswordResponse,
} from '@/Types/ForgotPassword'

export const signIn = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<ResponseType<AuthData>, Partial<SignInRequestData>>({
    query: body => ({
      url: '/api/v1/authenticate',
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

export const verifyEmail = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<OrgData[]>, string>({
    query: email => `/api/v1/userOrg?email=${email}`,
    transformResponse: (response: VerifyEmailResponse) => {
      const { code, errors, orgData = [] } = response
      const error =
        code !== 200 && errors && errors.length > 0 ? errors[0].message : ''
      const sortedOrgData = orgData.sort((a: OrgData, b: OrgData) =>
        a.name.localeCompare(b.name),
      )
      return { success: code === 200, error, data: sortedOrgData }
    },
  })
}

export const logout = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<string>, void>({
    query: () => '/api/v1/logout',
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
      url: '/api/v1/forgotpass',
      method: 'POST',
      body,
    }),
    transformResponse: (response: ForgotPasswordResponse) => {
      return { success: true, data: response.message }
    },
  })
}
