import { csApi } from '../../api'
import { logout, signIn, verifyEmail, forgotPassword } from './authentication'

export const authApi = csApi.injectEndpoints({
  endpoints: build => ({
    signIn: signIn(build),
    verifyEmail: verifyEmail(build),
    logout: logout(build),
    forgotPassword: forgotPassword(build),
  }),
  overrideExisting: false,
})

export const {
  useSignInMutation,
  useLazyVerifyEmailQuery,
  useLazyLogoutQuery,
} = authApi
