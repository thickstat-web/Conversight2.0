import { csApi } from '../../api'
import { getDatasets, getHelpQuestions } from './chat'

export const chatApi = csApi.injectEndpoints({
  endpoints: build => ({
    getDatasets: getDatasets(build),
    getHelpQuestions: getHelpQuestions(build),
  }),
  overrideExisting: false,
})

export const {
  useGetDatasetsQuery,
  useLazyGetDatasetsQuery,
  useGetHelpQuestionsQuery,
  useLazyGetHelpQuestionsQuery,
} = chatApi
