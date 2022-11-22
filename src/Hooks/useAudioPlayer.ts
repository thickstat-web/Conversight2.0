import { useCallback, useEffect, useState } from 'react'
import { AppState } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import TrackPlayer, {
  Event,
  State,
  useTrackPlayerEvents,
} from 'react-native-track-player'
import { useAppDispatch } from '.'
import { enableReadInsights, disableReadInsights } from '@/Store/Auth'
import { AudioTrack } from './helper'

export enum PlayerState {
  IDLE,
  LOADING,
  PLAYING,
  PAUSED,
  STOPPED,
}

const eventsToSubscribe = [
  Event.PlaybackState,
  Event.PlaybackMetadataReceived,
  Event.PlaybackTrackChanged,
  Event.PlaybackError,
]

export default function () {
  const dispatch = useAppDispatch()
  const isFocused = useIsFocused()
  const [trackIndex, setTrackIndex] = useState(0)
  // const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([])
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.IDLE)

  /* Audio player - Convert text to audio, play and pause functionalities */
  useEffect(() => {
    const setupPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer()
      } catch (err) { }
    }
    setupPlayer()
  }, [])

  useTrackPlayerEvents(eventsToSubscribe, async event => {
    const { type } = event
    if (type === Event.PlaybackState) {
      const { state } = event
      // console.log(`[useAudioPlayer] player state: ${JSON.stringify(event)}`)
      if (state === State.Playing) {
        setPlayerState(PlayerState.PLAYING)
      } else if (state === State.Connecting || state === State.Buffering) {
        setPlayerState(PlayerState.LOADING)
      } else if (state === State.Paused) {
        setPlayerState(PlayerState.PAUSED)
      } else if (state === State.Stopped || state === State.Ready) {
        setPlayerState(PlayerState.STOPPED)
      }
      // } else if (type === Event.PlaybackMetadataReceived) {
      // console.log(`[useInsightsData] player metadata: ${JSON.stringify(event)}`)
    } else if (type === Event.PlaybackTrackChanged && event.nextTrack != null) {
      const index = await TrackPlayer.getCurrentTrack()
      if (index && index !== trackIndex) {
        setTrackIndex(index || 0)
        console.log(`[useAudioPlayer] player current track index: ${index}`)
      } else {
        console.log(
          `[useAudioPlayer] player current track index ${index} ==== ${trackIndex}`,
        )
      }
    }
  })

  const addAudioTracks = useCallback(async (audioTracks: AudioTrack[]) => {
    await TrackPlayer.reset()
    await TrackPlayer.add(audioTracks)
  }, [])

  const play = useCallback(
    async (updateStore = false) => {
      await TrackPlayer.play()
      if (updateStore) {
        dispatch(enableReadInsights())
      }
    },
    [dispatch],
  )

  const playTrackByIndex = useCallback(async (index: number) => {
    // console.log(`[useAudionPlayer] playTrackByIndex: ${index}, audioTracks: ${audioTracks.length}`)
    // await addAudioTracks(audioTracks.slice(index, audioTracks.length))
    // await TrackPlayer.skip(index)
    // await TrackPlayer.play()
  }, [])

  const pause = useCallback(
    async (updateStore = false) => {
      await TrackPlayer.pause()
      if (updateStore) {
        dispatch(disableReadInsights())
      }
    },
    [dispatch],
  )

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState.match(/inactive|background/)) {
        pause(false)
      }
    })
    return () => subscription.remove()
  }, [pause])

  useEffect(() => {
    if (!isFocused) {
      pause(false)
    }
  }, [isFocused, pause])

  return {
    addAudioTracks,
    play,
    playTrackByIndex,
    pause,
    playerState,
    trackIndex,
  }
}
