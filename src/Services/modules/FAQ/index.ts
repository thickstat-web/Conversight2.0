import { botApi } from '@/Services/api'
import { getFaq } from './faq'

export const faqAPI = botApi.injectEndpoints({
  endpoints: build => ({
    getFaq: getFaq(build),
  }),
  overrideExisting: false,
})

export const { useGetFaqMutation } = faqAPI
