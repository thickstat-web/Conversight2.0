import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '.'
import { addConverseData, PinboardItem } from '@/Store/App'
import {
  useFetchPinnedItemDataMutation,
  useFetchPinnedItemsQuery,
} from '@/Services/modules/bot'
import { ConverseData } from '@/Types/ChatMessage'
import { PinnedItemRequest } from '@/Types/Pinboard'
import { processConverseData } from '@/Utils/chat-history-processor'
import { setComponentsDatasetIds } from '@/Store/Storyboard'
import { compact, map, uniq } from 'lodash'

export default function ({
  retainFilters,
  pinboardId,
}: {
  retainFilters: any
  pinboardId: string
}) {
  const [pinboardComponents, setPinboardComponents] = useState<PinboardItem[]>(
    [],
  )
  const dispatch = useAppDispatch()
  const [fetchPinnedItemData] = useFetchPinnedItemDataMutation()
  const { data, isLoading, isSuccess } = useFetchPinnedItemsQuery(pinboardId)
  const pinboardData = useMemo(() => data?.data || [], [data?.data])
  const componentsDatasetIds = uniq(compact(map(pinboardData, 'datasetId')));
  dispatch(setComponentsDatasetIds({ pinBoardID: pinboardId, componentsDatasetIds: componentsDatasetIds }));

  const getPinnedItemData = useCallback(
    (dataId: string) => {
      const reqData: PinnedItemRequest = {
        pinboardId,
        dataId,
        retainFilters
      }
      return fetchPinnedItemData(reqData).unwrap()
    },
    [fetchPinnedItemData, pinboardId , retainFilters],
  )

  useEffect(() => {
    function initFetchData(concurrentFetchRequests: number) {
      let ids: string[] = []
      let components: PinboardItem[] = []
      pinboardData.forEach(item => {
        const { id, title, renderType: mode } = item
        if(mode !== 'story'){
          ids.push(id)
          const pinItem: PinboardItem = {
            id,
            title,
            loading: true,
            isTextCard: false,
          }
          components.push(pinItem)
        }
      })
      setPinboardComponents(components)

      let index: number = -1
      const fetchData = async (batchSize: number = 1) => {
        while (batchSize > 0 && index < ids.length) {
          batchSize--
          index++
          const pinboardItemId = ids[index]
          console.log(
            `Processing index: ${index}, batch: ${batchSize}, pinboardItemId:${pinboardItemId} ...`,
          )
          // const resp = await getPinnedItemData(pinboardItemId)
          if (pinboardItemId) {
            getPinnedItemData(pinboardItemId).then(resp => {
              if (batchSize === 0 && index < ids.length) {
                fetchData(2)
              }
              if (resp.data?.length) {
                const rawPinnedItemData = resp.data[0]
                processConverseData(rawPinnedItemData).then(storeProcessedData)
              }
            })
          }
        }
      }

      fetchData(concurrentFetchRequests)

      const storeProcessedData = ({
        converseData,
      }: {
        converseData: ConverseData
      }) => {
        dispatch(addConverseData(converseData))
        console.log(
          `[usePinboardData] storeProcessedData id: ${converseData.id}`,
        )
        setPinboardComponents(prev => {
          const tempPinnedComponents = [...prev]
          const idx = prev.findIndex(item => item.id === converseData.id)
          tempPinnedComponents[idx] = {
            ...prev[idx],
            loading: false,
            isTextCard:
              !converseData.visualFormats ||
              !!converseData.visualFormats.find(_ => _.type === 'Text'),
          }
          return tempPinnedComponents
        })
      }
    }

    if (!isLoading && isSuccess) {
      initFetchData(4)
    }
  }, [
    dispatch,
    fetchPinnedItemData,
    isLoading,
    isSuccess,
    pinboardData,
    getPinnedItemData,
  ])

  return {
    isLoading,
    pinboardComponents,
    pinboardData,
  }
}
