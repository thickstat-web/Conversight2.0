import { ResponseType } from '@/Types/Common'
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { VerifyEmailResponse } from '@/Types/VerifyEmailResponse'
import { SignInRequestData } from '@/Types/SignInRequest'
import { SignInResponseData } from '@/Types/SignInResponse'

export const signIn = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<ResponseType, Partial<SignInRequestData>>({
    query: body => ({
      url: '/authenticate',
      method: 'POST',
      body,
    }),
    transformResponse: (response: SignInResponseData) => {
      const { data, errors } = response
      let signInResp = { success: false } as ResponseType
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
  return build.query<VerifyEmailResponse, string>({
    query: email => `/userOrg?email=${email}`,
    transformResponse: response => {
      const { code, errors, orgData } = response
      const error =
        code !== 200 && errors && errors.length > 0
          ? errors[0].message
          : 'Unable to verify the account right now. Please try again later'
      return { success: code === 200, error, data: orgData || [] }
    },
  })
}

// ToDo: Add result type
export const logout = (build: EndpointBuilder<any, any, any>) => {
  return build.query<any, string>({
    query: token => `/logout?token=${token}`,
  })
}
