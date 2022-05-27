import { csApi } from '@/Services/api'
import { getSettings } from './settings'

export const settingsApi = csApi.injectEndpoints({
  endpoints: build => ({
    getSettings: getSettings(build),
  }),
  overrideExisting: false,
})

export const { useGetSettingsMutation } = settingsApi
