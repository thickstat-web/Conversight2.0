import { csApi } from '../../api'
import { getDatasets } from './chat'

export const chatApi = csApi.injectEndpoints({
  endpoints: build => ({
    getDatasets: getDatasets(build),
  }),
  overrideExisting: false,
})

export const { useGetDatasetsQuery, useLazyGetDatasetsQuery } = chatApi
