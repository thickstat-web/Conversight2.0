import { api } from '../../api'
import { logout, signIn, verifyEmail } from './authentication'

export const authApi = api.injectEndpoints({
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
