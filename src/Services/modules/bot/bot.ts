import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { atob } from 'react-native-quick-base64'
import { ATHENA, MY_DASHBOARD, SHARED, getBotUrl } from '@/Config'
import { ResponseType } from '@/Types/Common'
import {
  ChatHistoryRequestData,
  ChatHistoryResponse,
} from '@/Types/ChatHistory'
import { RawConverseData } from '@/Types/ChatMessage'
import {
  PinnedItemRequest,
  Pinboard,
  PinnedItem,
  FilterValue,
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
import { InsightData, InsightsResponse } from '@/Types/Insights'
import { FollowupRequest, FollowupResponse } from '@/Types/Followup'
import { buildOrderedColumns } from '@/Utils/common'

export const getChatHistory = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<
    ResponseType<RawConverseData[]>,
    Partial<ChatHistoryRequestData>
  >({
    query: body => ({
      url: `${getBotUrl()}/history`,
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
            isColumnReorder,
          } = item
          return {
            columns,
            orderedColumns: buildOrderedColumns(
              isColumnReorder,
              colType,
              columns,
            ),
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
      operator,
      value,
      dateValues,
      isDefault,
    } = filter
    return {
      category,
      column: id,
      resolvedColumn: processedID,
      dateFrom: dateValueFrom,
      dateTo: dateValueTo,
      datasetId: data_set,
      operator,
      value: Array.isArray(value)
        ? (value as FilterValue[])
        : (value as string),
      dateValues: Array.isArray(dateValues) ? dateValues : [],
      isDefault,
    }
  })
}

const buildPinboard = (item: Created | Shared, shared: boolean): Pinboard => {
  const tags = Array.isArray(item.tags) ? item.tags : []
  tags.push(
    shared
      ? (item as Shared).ownerName.toLowerCase() === ATHENA
        ? ATHENA
        : SHARED
      : MY_DASHBOARD,
  )

  return {
    id: item.pinBoardID,
    name: item.pinName,
    ownedById: item.ownerID,
    shared,
    tags,
    appliedFilters: Array.isArray(item.retainFilters)
      ? buildAppliedFilters(item)
      : [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

export const fetchPinboards = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<Pinboard[]>, void>({
    query: () => `${getBotUrl()}/pinboard/data`,
    keepUnusedDataFor: 0,
    transformResponse: (response: ListPinboardsResponse) => {
      const { code, message, data } = response

      let created: Created[] = []
      let shared: Shared[] = []
      const { GetPinboardData } = data
      if (GetPinboardData) {
        created = GetPinboardData.created
        shared = GetPinboardData.shared
      }

      // Build user's own pinboard list
      let ownedPinboards: Pinboard[] = []
      if (Array.isArray(created) && created.length) {
        ownedPinboards = created
          .filter(item => item.pinName.trim().length)
          .map(item => buildPinboard(item, false))
      }

      // Build shared pinboard list
      let sharedPinboards: Pinboard[] = []
      if (Array.isArray(shared) && shared.length) {
        sharedPinboards = shared
          .filter(item => item.pinName.trim().length)
          .map(item => ({
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
      `${getBotUrl()}/pinboard/component?pinBoardID=${pinboardId}`,
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
        url: `${getBotUrl()}/pinboard/component/data?pinBoardID=${pinboardId}`,
        method: 'POST',
        body: { dataID },
      }
    },
    transformResponse: (
      response: PinnedItemDataResponse,
      meta: any,
      arg: Partial<PinnedItemRequest>,
    ) => {
      const {
        code,
        message,
        data: { pinBoardComponentData },
      } = response

      let rawPinnedItemData: RawConverseData[] = []
      if (Array.isArray(pinBoardComponentData)) {
        pinBoardComponentData.forEach(item => {
          const { data } = item
          const {
            ID,
            columns,
            colTypeString,
            isColumnReorder,
            createdAt,
            val,
            id,
            text = '',
            utterance,
            displayUtterance,
            status,
          } = data

          let rawData = {
            id: Array.isArray(arg.dataId) ? arg.dataId[0] : `${arg.dataId}`,
            columnMetadata: {},
            columns: [] as string[],
            orderedColumns: [] as string[],
            colType: { dim: [], date: [], metrics: [] },
            createdAt: 0,
            base64Data: '',
            text: `${text}`,
            pinboardItemId: '',
            utterance,
            status,
          }

          let orderedColumns: string[] = []
          let colType = { dim: [], date: [], metrics: [] }
          if (colTypeString) {
            colType = JSON.parse(colTypeString)
            orderedColumns = buildOrderedColumns(
              isColumnReorder,
              colType,
              columns,
            )
          }

          if (status !== 'failed') {
            rawData = {
              id: ID,
              columnMetadata: JSON.parse(data.colMetadata),
              columns,
              orderedColumns,
              colType,
              createdAt,
              base64Data: val,
              text: atob(data.questiontext),
              pinboardItemId: id,
              utterance: utterance.length ? utterance : displayUtterance,
              status,
            }
          }
          rawPinnedItemData.push(rawData)
        })
      }

      return {
        success: code === '200' && message === 'success',
        data: rawPinnedItemData,
      }
    },
  })
}

export const fetchInsightsData = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<
    ResponseType<InsightData[]>,
    Partial<string | string[]>
  >({
    query: (datasetIds: string | string[]) => {
      const body = {
        dataSetID: Array.isArray(datasetIds) ? datasetIds : [datasetIds],
      }
      return {
        url: `${getBotUrl()}/v2/proActiveInsights/user`,
        method: 'POST',
        body,
      }
    },
    transformResponse: (response: InsightsResponse) => {
      const {
        code,
        message,
        data: { proActiveInsightComp },
      } = response

      let insightsData: InsightData[] = []
      if (typeof proActiveInsightComp === 'object') {
        for (const datasetId in proActiveInsightComp) {
          const insightsByDataset = proActiveInsightComp[datasetId]
          if (insightsByDataset && Array.isArray(insightsByDataset)) {
            insightsData = [...insightsData, ...insightsByDataset]
          }
        }
      }

      return {
        success: code === '200' && message === 'success',
        data: insightsData,
      }
    },
  })
}

export const fetchFollowupData = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<
    ResponseType<RawConverseData[]>,
    Partial<FollowupRequest>
  >({
    query: body => {
      return {
        url: `${getBotUrl()}/v2/proActiveInsights/user/followup`,
        method: 'POST',
        body,
      }
    },
    transformResponse: (response: FollowupResponse) => {
      const {
        code,
        message,
        data: { proActiveInsightCompFollowup },
      } = response

      let rawConverseData: RawConverseData[] = []
      for (const datasetId in proActiveInsightCompFollowup) {
        const followupsByDataset = proActiveInsightCompFollowup[datasetId]
        for (const componentId in followupsByDataset) {
          const followupData = followupsByDataset[componentId]
          if (followupData) {
            const {
              columns = [],
              column_metadata = {},
              colType,
              isColumnReorder = false,
              createdAt = Date.now(),
              val = 'W10=',
              text = '',
              utterance = '',
              status = '',
            } = followupData

            if (status !== 'failed') {
              const data = {
                id: componentId,
                columnMetadata: column_metadata,
                columns,
                orderedColumns: buildOrderedColumns(
                  isColumnReorder,
                  colType,
                  columns,
                ),
                colType,
                createdAt,
                base64Data: val,
                text,
                utterance,
                status,
              }
              rawConverseData = [...rawConverseData, data]
            }
          }
        }
      }

      return {
        success: code === '200' && message === 'success',
        data: rawConverseData,
      }
    },
  })
}
