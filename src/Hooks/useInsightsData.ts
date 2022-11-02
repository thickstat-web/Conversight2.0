import { useCallback, useEffect, useState } from 'react'
import TrackPlayer, {
  Event,
  State,
  useTrackPlayerEvents,
} from 'react-native-track-player'
import { useAppDispatch, useAppSelector } from '.'
import {
  useFetchFollowupDataMutation,
  useFetchInsightsDataMutation,
} from '@/Services/modules/bot'
import { useGetDatasetsQuery, useGetTextToVoiceMutation } from '@/Services/modules/chat'
import { enableReadInsights, disableReadInsights, selectReadInsights } from '@/Store/Auth'
import { addConverseData } from '@/Store/App'
import { generateBatches } from '@/Utils/common'
import { processConverseData } from '@/Utils/chat-history-processor'
import { FollowupRequest } from '@/Types/Followup'
import { ConverseData } from '@/Types/ChatMessage'
import { InsightComponent, InsightData, InsightVoice } from '@/Types/Insights'
import { Text2VoiceRequest } from '@/Types/Voice'

export enum PlayerState {
  IDLE,
  LOADING,
  PLAYING,
  PAUSED,
}

export default function () {
  const dispatch = useAppDispatch()
  const readInsights = useAppSelector(selectReadInsights)
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
  const [trackIndex, setTrackIndex] = useState(0)
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.IDLE)

  const updateInsightComponent = (id: string, data: Partial<InsightComponent>) => (prev: InsightComponent[]) => {
    const tempInsightsComponents = [...prev]
    const idx = prev.findIndex(item => item.id === id)
    if (idx !== -1) {
      tempInsightsComponents[idx] = {
        ...prev[idx],
        ...data,
      }
    }
    return tempInsightsComponents
  }

  const storeProcessedData = useCallback(
    ({ converseData }: { converseData: ConverseData }) => {
      dispatch(addConverseData(converseData))
      // console.log(`[useInsightsData] Loaded followup Id: ${converseData.id}`)
      setInsightsComponents(updateInsightComponent(converseData.id, { followupLoading: false }))
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

  const makeText2VoiceReqData = (text: string): Text2VoiceRequest => ({
    text,
    textType: 'text',
    voiceLib: 'google',
    output: 'base64',
    lang: 'en-IN',
    voiceId: 'en-IN-Wavenet-D',
    pitch: 0,
    speakingRate: 1
  })

  const loadMore = useCallback(() => {
    if (batchGenerator) {
      const batch = batchGenerator.next()
      if (!batch.done) {
        const values: InsightComponent[] = batch.value as InsightComponent[]
        setInsightsComponents(preValues => [...preValues, ...values])
        const insightComponentIds = values.map(({ id }) => id)
        fetchFollowup(insightComponentIds)
      }
      setHasMore(!(batch?.done))
    }
  }, [batchGenerator, fetchFollowup])

  const insightComponentExtractor = ({ id }: InsightData): InsightComponent => ({
    id,
    followupLoading: true,
    voiceLoading: true,
    voice: ''
  })

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

            const batchGen = generateBatches<InsightData, InsightComponent>(
              sortedInsightsData,
              4,
              2,
              insightComponentExtractor,
            )
            setBatchGenerator(batchGen)
          }
        })
    }
  }, [datasetResp, datasetLoading, fetchInsightsData])

  useEffect(() => {
    loadMore()
  }, [loadMore])

  useEffect(() => {
    async function setupPlayer() {
      // console.log(`[useInsightsData] setupPlayer()...`)
      await TrackPlayer.setupPlayer()
    }
    setupPlayer()
    return () => {
      TrackPlayer.reset()
    }
  }, [])

  async function getInsightText2Voice(sortedInsightsData: InsightData[]) {
    const text2VoiceRespList = sortedInsightsData.map(async ({ id, answer }: InsightData) => {
      const data = makeText2VoiceReqData(answer)
      return { id, resp: await getText2Voice(data).unwrap() }
    })

    const text2VoiceList = (await Promise.all(text2VoiceRespList))
      .map(({ id, resp }) => ({ id, voice: resp?.data ?? '' }))
    return text2VoiceList
  }

  useEffect(() => {
    async function startPlayer() {
      const insightVoiceList = await getInsightText2Voice(insightsData)
      const voices = insightVoiceList.map(({ id, voice }) => ({ id, url: voice }))
      TrackPlayer.reset()
      // console.log(`[useInsightsData] voices: ${JSON.stringify(voices, null, 2)}`)
      await TrackPlayer.add(voices)
      TrackPlayer.play()
    }
    if (insightsData.length && readInsights) {
      TrackPlayer.getQueue().then(tracks => {
        if (tracks.length) {
          TrackPlayer.play()
        } else {
          setPlayerState(PlayerState.LOADING)
          startPlayer()
        }
      })
    }
  }, [insightsData, readInsights])

  const playPlayer = useCallback(() => {
    TrackPlayer.play().then(() => dispatch(enableReadInsights()))
  }, [])

  const pausePlayer = useCallback(() => {
    TrackPlayer.pause().then(() => dispatch(disableReadInsights()))
  }, [])

  const events = [
    Event.PlaybackState,
    Event.PlaybackMetadataReceived,
    Event.PlaybackTrackChanged,
    Event.PlaybackError,
  ]
  useTrackPlayerEvents(events, async event => {
    if (event.type === Event.PlaybackState) {
      // console.log(`[useInsightsData] player state: ${JSON.stringify(event)}`)
      if (event.state === State.Playing) {
        setPlayerState(PlayerState.PLAYING)
      } else if (event.state === State.Connecting || event.state === State.Buffering || event.state === State.Ready) {
        setPlayerState(PlayerState.LOADING)
      } else if (event.state === State.Paused) {
        setPlayerState(PlayerState.PAUSED)
      }
    } else if (event.type === Event.PlaybackMetadataReceived) {
      // console.log(`[useInsightsData] player metadata: ${JSON.stringify(event)}`)
    } else if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
      const index = await TrackPlayer.getCurrentTrack()
      setTrackIndex(index || 0)
    }
  })

  return {
    isLoading: datasetLoading || insightsLoading,
    insightsComponents,
    followupLoading,
    insightsData,
    hasMoreFollowupComponent: hasMore,
    loadMoreFollowupComponent: loadMore,
    trackIndex,
    playerState,
    pausePlayer,
    playPlayer,
  }
}
