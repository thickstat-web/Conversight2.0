import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch } from '.'
import {
  useFetchFollowupDataMutation,
  useFetchInsightsDataMutation,
} from '@/Services/modules/bot'
import { useGetDatasetsQuery } from '@/Services/modules/chat'
import { addConverseData } from '@/Store/App'
import { generateBatches } from '@/Utils/common'
import { processConverseData } from '@/Utils/chat-history-processor'
import { FollowupRequest } from '@/Types/Followup'
import { ConverseData } from '@/Types/ChatMessage'
import { InsightComponent, InsightData } from '@/Types/Insights'

export default function () {
  const dispatch = useAppDispatch()

  const { data: datasetResp, isLoading: datasetLoading } = useGetDatasetsQuery()
  const [fetchInsightsData, { isLoading: insightsLoading }] =
    useFetchInsightsDataMutation()
  const [fetchFollowupData, { isLoading: followupLoading }] =
    useFetchFollowupDataMutation()

  const [insightsData, setInsightsData] = useState<InsightData[]>([])
  const [batchGenerator, setBatchGenerator] =
    useState<Generator<InsightData[] | InsightComponent[], void, unknown>>()
  const [insightsComponents, setInsightsComponents] = useState<
    InsightComponent[]
  >([])
  const [hasMore, setHasMore] = useState(false)

  const storeProcessedData = useCallback(
    ({ converseData }: { converseData: ConverseData }) => {
      dispatch(addConverseData(converseData))
      console.log(`[useInsightsData] Loaded followup Id: ${converseData.id}`)
      setInsightsComponents(prev => {
        const tempInsightsComponents = [...prev]
        const idx = prev.findIndex(item => item.id === converseData.id)
        if (idx !== -1) {
          tempInsightsComponents[idx] = {
            ...prev[idx],
            followupLoading: false,
          }
        }
        return tempInsightsComponents
      })
    },
    [dispatch],
  )

  const makeFollowupRequest = (
    insightComponentIds: string[],
  ): FollowupRequest => ({
    followup: [
      {
        dataSetID: '',
        proActiveCompIDs: insightComponentIds,
      },
    ],
  })

  // Bulk load followup data as multiple batches
  const fetchFollowup = useCallback(
    async (insightComponentIds: string[]) => {
      const followupRequest = makeFollowupRequest(insightComponentIds)
      fetchFollowupData(followupRequest)
        .unwrap()
        .then(resp => {
          resp.data?.forEach(rawFollowupComponentData => {
            processConverseData(rawFollowupComponentData).then(
              storeProcessedData,
            )
          })
        })
    },
    [fetchFollowupData, storeProcessedData],
  )

  const loadMore = useCallback(() => {
    if (batchGenerator) {
      const batch = batchGenerator?.next()
      if (!batch.done) {
        const values: InsightComponent[] = batch.value as InsightComponent[]
        setInsightsComponents(preValues => [...preValues, ...values])
        const insightComponentIds = values.map(({ id }) => id)
        fetchFollowup(insightComponentIds)
      }
      setHasMore(batch?.done === false)
    }
  }, [batchGenerator, fetchFollowup])

  useEffect(() => {
    // Initiate loding insights data for the entire datasets
    // console.log('[useInsightsData] useEffect #1....')
    const datasets = datasetResp?.data || []
    if (!datasetLoading && datasets.length) {
      const datasetIds = datasets.map(item => item.dataSetID)
      fetchInsightsData(datasetIds)
        .unwrap()
        .then(insightsDataResp => {
          const { success, data } = insightsDataResp
          if (success && data && data.length) {
            const sortByUpdateTime = (a: InsightData, b: InsightData) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            const sortedInsightsData = [...data].sort(sortByUpdateTime)
            setInsightsData(sortedInsightsData)

            const extractor = ({ id }: InsightData): InsightComponent => ({
              id,
              followupLoading: true,
            })
            const batchGen = generateBatches<InsightData, InsightComponent>(
              sortedInsightsData,
              4,
              2,
              extractor,
            )
            setBatchGenerator(batchGen)
          }
        })
    }
  }, [datasetResp, datasetLoading, fetchInsightsData])

  useEffect(() => {
    loadMore()
  }, [loadMore])

  return {
    isLoading: datasetLoading || insightsLoading,
    insightsComponents,
    followupLoading,
    insightsData,
    hasMoreFollowupComponent: hasMore,
    loadMoreFollowupComponent: loadMore,
  }
}
