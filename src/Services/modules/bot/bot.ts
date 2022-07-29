import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { ResponseType } from '@/Types/Common'
import {
  ChatHistoryRequestData,
  ChatHistoryResponse,
} from '@/Types/ChatHistory'
import { RawChatMessage } from '@/Types/ChatMessage'
import {
  RawPinnedItemData,
  PinnedItemRequest,
  Pinboard,
  PinnedItem,
} from '@/Types/Pinboard'
import { ListPinboardsResponse } from '@/Types/PinboardsResponse'
import {
  ListPinnedItemsResponse,
  PinBoardComponent,
} from '@/Types/PinnedItemsResponse'
import { PinnedItemDataResponse } from '@/Types/PinnedItemDataResponse'

export const getChatHistory = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<
    ResponseType<RawChatMessage[]>,
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
            displayUtterance,
            text,
            utterance,
            status,
          }
        })
        .sort(
          (a: RawChatMessage, b: RawChatMessage) => a.createdAt - b.createdAt,
        )
      return { success: respStatus, data: sortedMessages }
    },
  })
}

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

      let ownedPinboards: Pinboard[] = []
      if (Array.isArray(created)) {
        ownedPinboards = created.map(item => ({
          id: item.pinBoardID,
          name: item.pinName,
          ownedById: item.ownerID,
          shared: false,
          tags: (Array.isArray(item.tags) ? item.tags : []).concat(
            'My Dashboard',
          ),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }))
      }

      let sharedPinboards: Pinboard[] = []
      if (Array.isArray(shared)) {
        sharedPinboards = shared.map(item => ({
          id: item.pinBoardID,
          name: item.pinName,
          ownedById: item.ownerID,
          ownedByName: item.ownerName,
          shared: true,
          tags: (Array.isArray(item.tags) ? item.tags : []).concat('Shared'),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
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

      const getTitle = (item: PinBoardComponent) => {
        const { title = '', displayUtterance = '', utterance = '' } = item
        return title.length
          ? title
          : displayUtterance.length
            ? displayUtterance
            : utterance
      }

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
    ResponseType<RawPinnedItemData[]>,
    Partial<PinnedItemRequest>
  >({
    query: data => {
      const { pinboardId, dataID } = data
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

      let pinnedItemData: RawPinnedItemData[] = []
      if (Array.isArray(pinBoardComponentData)) {
        pinnedItemData = pinBoardComponentData.map(item => {
          const { data } = item
          return {
            id: data.ID,
            columnMetadata: JSON.parse(data.colMetadata),
            columns: data.columns,
            colType: JSON.parse(data.colTypeString),
            createdAt: data.createdAt,
            base64Data: data.val,
            base64QuestionText: data.questiontext,
            pinboardItemId: data.id,
            displayUtterance: data.displayUtterance,
          }
        })
      }

      return {
        success: code === '200' && message === 'success',
        data: pinnedItemData,
      }
    },
  })
}
