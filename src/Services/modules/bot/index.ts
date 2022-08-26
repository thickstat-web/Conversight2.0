import { botApi } from '../../api'
import {
  fetchFollowupData,
  fetchInsightsData,
  fetchPinboards,
  fetchPinnedItemData,
  fetchPinnedItems,
  getChatHistory,
} from './bot'

export const botApiSlice = botApi.injectEndpoints({
  endpoints: build => ({
    getChatHistory: getChatHistory(build),
    fetchPinboards: fetchPinboards(build),
    fetchPinnedItems: fetchPinnedItems(build),
    fetchPinnedItemData: fetchPinnedItemData(build),
    fetchInsightsData: fetchInsightsData(build),
    fetchFollowupData: fetchFollowupData(build),
  }),
  overrideExisting: false,
})

export const {
  useGetChatHistoryMutation,
  useFetchPinboardsQuery,
  useLazyFetchPinboardsQuery,
  useFetchPinnedItemsQuery,
  useLazyFetchPinnedItemsQuery,
  useFetchPinnedItemDataMutation,
  useFetchInsightsDataMutation,
  useFetchFollowupDataMutation,
} = botApiSlice
