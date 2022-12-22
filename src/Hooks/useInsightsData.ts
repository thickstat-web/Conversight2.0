import { useCallback, useEffect, useState } from 'react'
// import { AppState } from 'react-native'
// import { useIsFocused } from '@react-navigation/native'
import { useAppDispatch, useAppSelector } from '.'
import {
  useFetchFollowupDataMutation,
  useFetchInsightsDataMutation,
} from '@/Services/modules/bot'
import {
  useGetDatasetsQuery,
  useGetTextToVoiceMutation,
} from '@/Services/modules/chat'
import {
  // enableReadInsights,
  // disableReadInsights,
  selectReadInsights,
} from '@/Store/Auth'
import { addConverseData, addUrlFollowupData } from '@/Store/App'
import {
  AudioTrack,
  insightComponentExtractor,
  makeFollowupRequest,
  makeTextToVoiceRequestData,
  responseToAudioTrack,
  updateInsightComponent,
  VoiceResponse,
} from './helper'
// import { generateBatches } from '@/Utils/common'
import { processConverseData } from '@/Utils/chat-history-processor'
import { ResponseType, URLFollowupData } from '@/Types/Common'
import { RawFollowupData } from '@/Types/Followup'
import { ConverseData, RawConverseData } from '@/Types/ChatMessage'
import { InsightComponent, InsightData, InsightVoice } from '@/Types/Insights'

export default function () {
  const dispatch = useAppDispatch()
  // const readInsights = useAppSelector(selectReadInsights)
  const { data: datasetResp, isLoading: datasetLoading } = useGetDatasetsQuery()
  const [fetchInsightsData, { isLoading: insightsLoading }] =
    useFetchInsightsDataMutation()
  const [fetchFollowupData, { isLoading: followupLoading }] =
    useFetchFollowupDataMutation()
  const [getText2Voice] = useGetTextToVoiceMutation()

  const [insightsData, setInsightsData] = useState<InsightData[]>([])
  const [batchGenerator, setBatchGenerator] =
    useState<Generator<InsightData[] | InsightComponent[], void, unknown>>()
  const [insightsComponents, setInsightsComponents] = useState<
    InsightComponent[]
  >([])
  const [hasMore, setHasMore] = useState(false)
  const [loadingInsightsAudio, setLoadingInsightsAudio] = useState(true)
  const [insightsAudioList, setInsightsAudioList] = useState<AudioTrack[]>([])

  useEffect(() => {
    // Initiate loading insights data for the entire datasets
    const datasets = datasetResp?.data || []
    if (!datasetLoading && datasets.length) {
      const datasetIds = datasets.map(item => item.dataSetID)
      fetchInsightsData(datasetIds)
        .unwrap()
        .then(async insightsDataResp => {
          const { success, data } = insightsDataResp
          if (success && data && data.length) {
            const sortByUpdateTime = (a: InsightData, b: InsightData) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            const sortedInsightsData = [...data].sort(sortByUpdateTime)
            setInsightsData(sortedInsightsData)
            setInsightsComponents(
              sortedInsightsData.map(insightComponentExtractor),
            )

            // const batchGenerator = generateBatches<InsightData, InsightComponent>(
            //   sortedInsightsData,
            //   4,
            //   4,
            //   insightComponentExtractor,
            // )
            // batchGenerator.
            // setBatchGenerator(batchGenerator)
          }
        })
    }
  }, [datasetResp, datasetLoading, fetchInsightsData])

  const storeProcessedData = useCallback(
    ({ converseData }: { converseData: ConverseData }) => {
      dispatch(addConverseData(converseData))
      // console.log(`[useInsightsData] Loaded followup Id: ${converseData.id}`)
      setInsightsComponents(
        updateInsightComponent(converseData.id, { followupLoading: false }),
      )
    },
    [dispatch],
  )

  // Process and store the followup data
  const processAndStoreFollowupData = useCallback(
    (resp: ResponseType<RawFollowupData[]>): void => {
      resp.data?.forEach(rawFollowupData => {
        if (rawFollowupData.type === 'WebURL') {
          const data = rawFollowupData.data as URLFollowupData
          dispatch(addUrlFollowupData(data))
        } else {
          const data = rawFollowupData.data as RawConverseData
          processConverseData(data).then(storeProcessedData)
        }
      })
    },
    [dispatch, storeProcessedData],
  )

  // Bulk load followup data as multiple batches
  const fetchFollowup = useCallback(
    async (insightComponentIds: string[]) => {
      const followupRequest = makeFollowupRequest(insightComponentIds)
      fetchFollowupData(followupRequest)
        .unwrap()
        .then(processAndStoreFollowupData)
    },
    [fetchFollowupData, processAndStoreFollowupData],
  )

  const loadMore = useCallback(() => {
    if (batchGenerator) {
      const batch = batchGenerator.next()
      if (!batch.done) {
        const values: InsightComponent[] = batch.value as InsightComponent[]
        setInsightsComponents(preValues => [...preValues, ...values])
        const insightComponentIds = values.map(({ id }) => id)
        fetchFollowup(insightComponentIds)
      }
      setHasMore(!batch?.done)
    }
  }, [batchGenerator, fetchFollowup])

  // Convert all the insights text in to audio with parallel request
  const convertTextToVoice = useCallback(
    async (insightsData: InsightData[]) => {
      // Make a parallel voice to text request
      const text2VoiceRespList = insightsData.map(
        async ({ id, answer }: InsightData) => {
          const data = makeTextToVoiceRequestData(answer)
          const result: VoiceResponse = {
            id,
            resp: await getText2Voice(data).unwrap(),
          }
          return result
        },
      )

      // Wait for all the parallel requests to complete and conver to AudioTrack format
      return (await Promise.all(text2VoiceRespList)).map(responseToAudioTrack)
    },
    [getText2Voice],
  )

  useEffect(() => {
    const initTextToVoiceConversion = async () => {
      // setLoadingInsightsAudio(true)
      const insightsVoiceList = await convertTextToVoice(insightsData)
      setInsightsAudioList(insightsVoiceList)
    }

    if (!insightsLoading && insightsData.length) {
      initTextToVoiceConversion()
    }
    setLoadingInsightsAudio(false)
  }, [insightsLoading, insightsData, convertTextToVoice])

  return {
    isLoading: datasetLoading || insightsLoading,
    loadingInsightsAudio,
    insightsComponents,
    followupLoading,
    insightsData,
    insightsAudioList,
    hasMoreFollowupComponent: hasMore,
    loadMoreFollowupComponent: loadMore,
    fetchFollowup,
  }
}
