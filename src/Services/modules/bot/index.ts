import { botApi } from '../../api'
import {
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
} = botApiSlice
