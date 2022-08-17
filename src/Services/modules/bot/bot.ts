import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { atob } from 'react-native-quick-base64'
import { MY_DASHBOARD, SHARED } from '@/Config'
import { ResponseType } from '@/Types/Common'
import {
  ChatHistoryRequestData,
  ChatHistoryResponse,
} from '@/Types/ChatHistory'
import { RawConverseData } from '@/Types/ChatMessage'
import {
  RawPinnedItemData,
  PinnedItemRequest,
  Pinboard,
  PinnedItem,
  FilterValue,
  FilterCategory,
  Filter,
} from '@/Types/Pinboard'
import {
  Created,
  Shared,
  ListPinboardsResponse,
} from '@/Types/PinboardsResponse'
import {
  ListPinnedItemsResponse,
  PinBoardComponent,
} from '@/Types/PinnedItemsResponse'
import { PinnedItemDataResponse } from '@/Types/PinnedItemDataResponse'

export const getChatHistory = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<
    ResponseType<RawConverseData[]>,
    Partial<ChatHistoryRequestData>
  >({
    query: body => ({
      url: '/history',
      method: 'POST',
      body,
    }),
    transformResponse: (response: ChatHistoryResponse) => {
      const { status: respStatus, data = [] } = response
      const sortedMessages = data
        .map(item => {
          const {
            columns,
            column_metadata,
            colType,
            createdAt,
            val,
            ID,
            displayUtterance,
            text,
            utterance,
            status,
          } = item
          return {
            columns,
            columnMetadata: column_metadata,
            colType,
            createdAt,
            base64Data: val,
            id: ID,
            text,
            utterance: displayUtterance.length ? displayUtterance : utterance,
            status,
          }
        })
        .sort(
          (a: RawConverseData, b: RawConverseData) => a.createdAt - b.createdAt,
        )
      return { success: respStatus, data: sortedMessages }
    },
  })
}

function buildAppliedFilters(item: Created | Shared): Filter[] {
  return item.retainFilters.map(filter => {
    const {
      category,
      id,
      processedID,
      dateValueFrom,
      dateValueTo,
      data_set,
      value,
      isDefault,
    } = filter
    return {
      category,
      column: id,
      resolvedColumn: processedID,
      dateFrom: dateValueFrom,
      dateTo: dateValueTo,
      datasetId: data_set,
      value: Array.isArray(value)
        ? (value as FilterValue[])
        : (value as string),
      isDefault,
    }
  })
}

const buildPinboard = (item: Created | Shared, shared: boolean): Pinboard => ({
  id: item.pinBoardID,
  name: item.pinName,
  ownedById: item.ownerID,
  shared,
  tags: (Array.isArray(item.tags) ? item.tags : []).concat(
    shared ? SHARED : MY_DASHBOARD,
  ),
  appliedFilters: Array.isArray(item.retainFilters)
    ? buildAppliedFilters(item)
    : [],
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
})

export const fetchPinboards = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<Pinboard[]>, void>({
    query: () => '/getPinBoardData',
    transformResponse: (response: ListPinboardsResponse) => {
      const {
        code,
        message,
        data: {
          GetPinboardData: { created, shared },
        },
      } = response

      // Build user's own pinboard list
      let ownedPinboards: Pinboard[] = []
      if (Array.isArray(created)) {
        ownedPinboards = created.map(item => buildPinboard(item, false))
      }

      // Build shared pinboard list
      let sharedPinboards: Pinboard[] = []
      if (Array.isArray(shared)) {
        sharedPinboards = shared.map(item => ({
          ...buildPinboard(item, true),
          ownedByName: item.ownerName,
        }))
      }

      const pinboards = [...ownedPinboards, ...sharedPinboards]
      return {
        success: code === '200' && message === 'success',
        data: pinboards,
      }
    },
  })
}

const getTitle = (item: PinBoardComponent) => {
  const { title = '', displayUtterance = '', utterance = '' } = item
  return title.length
    ? title
    : displayUtterance.length
      ? displayUtterance
      : utterance
}

export const fetchPinnedItems = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<PinnedItem[]>, string>({
    query: (pinboardId: string) =>
      `/pinboardComponent?pinBoardID=${pinboardId}`,
    transformResponse: (response: ListPinnedItemsResponse) => {
      const {
        code,
        message,
        data: { pinBoardComponents },
      } = response

      let pinnedItems: PinnedItem[] = []
      if (Array.isArray(pinBoardComponents)) {
        pinnedItems = pinBoardComponents.map(item => ({
          id: item.referenceID,
          title: getTitle(item).trim(),
          renderType: item.chartType,
          pinboardId: item.pinBoardID,
          datasetId: item.dataSetID,
          createdAt: item.createdAt,
        }))
      }

      return {
        success: code === '200' && message === 'success',
        data: pinnedItems,
      }
    },
  })
}

export const fetchPinnedItemData = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<
    ResponseType<RawConverseData[]>,
    Partial<PinnedItemRequest>
  >({
    query: data => {
      const { pinboardId, dataId } = data
      const dataID = Array.isArray(dataId) ? dataId : [dataId]
      return {
        url: `/PinBoardComponentData?pinBoardID=${pinboardId}`,
        method: 'POST',
        body: { dataID },
      }
    },
    transformResponse: (response: PinnedItemDataResponse) => {
      const {
        code,
        message,
        data: { pinBoardComponentData },
      } = response

      let rawPinnedItemData: RawConverseData[] = []
      if (Array.isArray(pinBoardComponentData)) {
        rawPinnedItemData = pinBoardComponentData.map(item => {
          const { data } = item
          return {
            id: data.ID,
            columnMetadata: JSON.parse(data.colMetadata),
            columns: data.columns,
            colType: JSON.parse(data.colTypeString),
            createdAt: data.createdAt,
            base64Data: data.val,
            text: atob(data.questiontext),
            pinboardItemId: data.id,
            utterance: data.displayUtterance,
            status: data.status,
          }
        })
      }

      return {
        success: code === '200' && message === 'success',
        data: rawPinnedItemData,
      }
    },
  })
}
