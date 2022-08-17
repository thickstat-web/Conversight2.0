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

export default function (pinboardId: string) {
  const [pinboardComponents, setPinboardComponents] = useState<PinboardItem[]>(
    [],
  )
  const dispatch = useAppDispatch()
  const [fetchPinnedItemData] = useFetchPinnedItemDataMutation()
  const { data, isLoading, isSuccess } = useFetchPinnedItemsQuery(pinboardId)
  const pinboardData = useMemo(() => data?.data || [], [data?.data])

  const getPinnedItemData = useCallback(
    (dataId: string) => {
      const reqData: PinnedItemRequest = {
        pinboardId,
        dataId,
      }
      return fetchPinnedItemData(reqData).unwrap()
    },
    [fetchPinnedItemData, pinboardId],
  )

  useEffect(() => {
    function initFetchData(concurrentFetchRequests: number) {
      let ids: string[] = []
      let components: PinboardItem[] = []
      pinboardData.forEach(item => {
        const { id } = item
        ids.push(id)
        const pinItem: PinboardItem = {
          id,
          loading: true,
          isTextCard: false,
        }
        components.push(pinItem)
      })
      setPinboardComponents(components)

      const fetchData = async (batchSize: number = 1, index: number = 0) => {
        while (batchSize >= 0 && index < ids.length) {
          const pinboardItemId = ids[index]
          if (pinboardItemId === undefined) {
            return
          }

          console.log(
            `Processing index: ${index}, batch: ${batchSize}, pinboardItemId:${pinboardItemId} ...`,
          )

          const resp = await getPinnedItemData(pinboardItemId)
          batchSize--
          index++
          if (batchSize === 0 && index < ids.length) {
            fetchData(2, index)
          }
          if (resp.data?.length) {
            const rawPinnedItemData = resp.data[0]
            processConverseData(rawPinnedItemData).then(storeProcessedData)
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
        setPinboardComponents(prev => {
          const tempPinnedComponents = [...prev]
          const idx = prev.findIndex(item => item.id === converseData.id)
          tempPinnedComponents[idx] = {
            ...prev[idx],
            loading: false,
            isTextCard: !!converseData.visualFormats.find(
              _ => _.type === 'Text',
            ),
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
