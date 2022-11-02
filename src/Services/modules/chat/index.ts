import { csApi } from '../../api'
import { getDatasets, getHelpQuestions, getTextToVoice } from './chat'

export const chatApi = csApi.injectEndpoints({
  endpoints: build => ({
    getDatasets: getDatasets(build),
    getHelpQuestions: getHelpQuestions(build),
    getTextToVoice: getTextToVoice(build),
  }),
  overrideExisting: false,
})

export const {
  useGetDatasetsQuery,
  useLazyGetDatasetsQuery,
  useGetHelpQuestionsQuery,
  useLazyGetHelpQuestionsQuery,
  useGetTextToVoiceMutation,
} = chatApi
