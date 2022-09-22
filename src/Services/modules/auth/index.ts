import { csApi } from '../../api'
import { verifyEmail, signIn, sendFCMToken, forgotPassword, logout, } from './authentication'

export const authApi = csApi.injectEndpoints({
  endpoints: build => ({
    verifyEmail: verifyEmail(build),
    signIn: signIn(build),
    sendFCMToken: sendFCMToken(build),
    logout: logout(build),
    forgotPassword: forgotPassword(build),
  }),
  overrideExisting: false,
})

export const {
  useLazyVerifyEmailQuery,
  useSignInMutation,
  useSendFCMTokenMutation,
  useLazyLogoutQuery,
} = authApi
