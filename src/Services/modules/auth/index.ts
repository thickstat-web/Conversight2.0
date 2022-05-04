import { csApi } from '../../api'
import { logout, signIn, verifyEmail } from './authentication'

export const authApi = csApi.injectEndpoints({
  endpoints: build => ({
    signIn: signIn(build),
    verifyEmail: verifyEmail(build),
    logout: logout(build),
  }),
  overrideExisting: false,
})

export const {
  useSignInMutation,
  useLazyVerifyEmailQuery,
  useLogoutQuery,
} = authApi
