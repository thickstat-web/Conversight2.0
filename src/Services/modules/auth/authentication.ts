import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { VerifyEmailResponse } from '@/Types/VerifyEmailResponse'
import { AuthRequestData } from '@/Types/SignInRequest'
import { AuthResponseData } from '@/Types/SignInResponse'

export const signIn = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<AuthResponseData, Partial<AuthRequestData>>({
    query: body => ({
      url: '/authenticate',
      method: 'POST',
      body,
    }),
    transformResponse: response => response.data,
  })
}

export const verifyEmail = (build: EndpointBuilder<any, any, any>) => {
  return build.query<VerifyEmailResponse, string>({
    query: email => `/userOrg?email=${email}`,
  })
}

// ToDo: Add result type
export const logout = (build: EndpointBuilder<any, any, any>) => {
  return build.query<any, string>({
    query: token => `/logout?token=${token}`,
  })
}
