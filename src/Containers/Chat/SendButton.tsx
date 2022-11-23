import React, { useState, useEffect, useCallback } from 'react'
import { StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { View } from 'react-native-ui-lib'
import Icon from 'react-native-vector-icons/Ionicons'
import { PulseAnimation } from 'react-native-animated-pulse'
import Voice, {
  SpeechEndEvent,
  SpeechErrorEvent,
  SpeechResultsEvent,
  SpeechStartEvent,
  SpeechVolumeChangeEvent,
} from '@react-native-voice/voice'
import { useTheme } from '@/Hooks'
import { debounce } from '@/Utils/common'

const BUTTON_SIZE = 40

export enum MicState {
  IDLE,
  LISTENING,
  STOPPED,
}

type SendButtonProps = {
  loading: boolean
  query: string
  setQuery: (query: string) => void
  onPress: () => void
}

const SendButton = ({ loading, query, setQuery, onPress }: SendButtonProps) => {
  const { Colors } = useTheme()
  const [listening, setListening] = useState(false)
  const [micState, setMicState] = useState(MicState.IDLE)

  const stopRecognizing = useCallback(async () => {
    try {
      await Voice.stop()
      // await Voice.destroy()
    } catch (e) {
      // console.error(e)
    } finally {
      setMicState(MicState.STOPPED)
      setListening(false)
      // console.log('Speech recognition has stopped')
    }
  }, [])

  const stopWhenTimedout = useCallback(() => {
    debounce(() => {
      stopRecognizing()
    }, 4000)
  }, [stopRecognizing])

  const startRecognizing = async () => {
    try {
      await Voice.start('en-IN')
      setMicState(MicState.LISTENING)
      stopWhenTimedout()
    } catch (e) {
      // console.error(e)
    }
  }

  const onSpeechStart = useCallback((e: SpeechStartEvent) => {
    // console.log('The Speech has started')
    if (e && e.error) {
      // console.log('onSpeechStart: ', e.error)
    }
  }, [])

  const onSpeechEnd = useCallback(
    (e: SpeechEndEvent) => {
      // console.log('The Speech has ended')
      if (e && e.error) {
        // console.log('onSpeechEnd: ', e.error)
      }
      stopRecognizing()
    },
    [stopRecognizing],
  )

  // const onSpeechError = useCallback(
  //   async (e: SpeechErrorEvent) => {
  //     // console.log('Speech ends with error')
  //     if (e && e.error) {
  //       console.log('onSpeechError: ', e.error)
  //     }
  //     stopRecognizing()
  //   },
  //   [stopRecognizing],
  // )

  const onSpeechResults = useCallback(
    (e: SpeechResultsEvent) => {
      if (e.value) {
        const text = e.value[0]
        if (text.length && text !== query) {
          // console.log(`[SendButton] onSpeechResults: value: ${text}`)
          setQuery(text)
        }
      }
      stopWhenTimedout()
    },
    [query, setQuery, stopWhenTimedout],
  )

  const onSpeechPartialResults = useCallback(
    (e: SpeechResultsEvent) => {
      if (e.value) {
        const text = e.value[0]
        if (text.length && text !== query) {
          // console.log(`[SendButton] onSpeechPartialResults: value: ${text}`)
          setQuery(text)
        }
      }
      stopWhenTimedout()
    },
    [query, setQuery, stopWhenTimedout],
  )

  const onSpeechVolumeChanged = useCallback((e: SpeechVolumeChangeEvent) => {
    if (e.value) {
      // console.log('onSpeechVolumeChanged: value:', e.value)
    }
  }, [])

  useEffect(() => {
    // Voice.onSpeechStart = onSpeechStart
    Voice.onSpeechEnd = onSpeechEnd
    // Voice.onSpeechError = onSpeechError
    Voice.onSpeechResults = onSpeechResults
    Voice.onSpeechPartialResults = onSpeechPartialResults
    // Voice.onSpeechVolumeChanged = onSpeechVolumeChanged

    return () => {
      Voice.destroy().then(Voice.removeAllListeners)
    }
  }, [])

  const toggleMicrophone = async () => {
    if (listening) {
      await stopRecognizing()
    } else {
      await startRecognizing()
    }
    setListening(!listening)
  }

  return loading ? (
    <Pressable style={styles.buttonContainer} onPress={onPress}>
      <View style={styles.textButtonWrapper}>
        <ActivityIndicator color={Colors.WHITE} />
      </View>
    </Pressable>
  ) : (micState === MicState.IDLE || micState === MicState.STOPPED) &&
    query.length ? (
    <Pressable style={styles.buttonContainer} onPress={onPress}>
      <View style={styles.textButtonWrapper}>
        <Icon name={'send'} size={24} color={Colors.WHITE} />
      </View>
    </Pressable>
  ) : (
    <Pressable style={styles.buttonContainer} onPress={toggleMicrophone}>
      {listening && (
        <PulseAnimation
          color={'#69fb9a'}
          numPulses={3}
          diameter={50}
          speed={1500}
          duration={2800}
        />
      )}
      <View style={styles.micButtonWrapper}>
        <Icon
          name={'mic'}
          size={28}
          color={listening ? '#b0f898' : Colors.WHITE}
        />
      </View>
    </Pressable>
  )
}
export default SendButton

const styles = StyleSheet.create({
  buttonContainer: {
    height: BUTTON_SIZE,
    width: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE,
    overflow: 'hidden',
    // backgroundColor: '#02b53e',
    backgroundColor: '#00AA39',
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButtonWrapper: {
    position: 'absolute',
    margin: 7,
    marginLeft: 10,
  },
  micButtonWrapper: {
    position: 'absolute',
    margin: 5,
  },
})
