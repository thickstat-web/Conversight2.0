import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction,
  useEffect,
  useRef,
} from 'react'
import { StyleSheet, TextInput, Animated } from 'react-native'
import { View } from 'react-native-ui-lib'
import { useSendChatMessageMutation } from '@/Services/modules/ingress'
import { useAppDispatch, useAppSelector, useTheme } from '@/Hooks'
import {
  processAndAddChatMessage,
  addChatMessage,
  selectProcessingChatMessage,
} from '@/Store/App'
import Voice from '@react-native-voice/voice'
import Ionicon from 'react-native-vector-icons/Ionicons'
import { selectDatasetId } from '@/Store/Auth'
import { SendChatMessage } from '@/Types/SendChatMessage'
import {
  makeAthenaFailureMessage,
  makeUserMessage,
} from '@/Utils/chat-history-processor'
import DatasetChooser from './DatasetChooser'
import FAQPicker from './FAQPicker'
import { NO_DATA_AVAILABLE } from '@/Config'
import { RawConverseData } from '@/Types/ChatMessage'
import { ResponseType } from '@/Types/Common'
import { TouchableHighlight as TouchableOpacity } from 'react-native-gesture-handler'
// import { PulseAnimation } from 'react-native-animated-pulse'

export declare type RefProps = {
  setUtterance: (text: string) => void
}

interface ChatBoxOptions {
  onDatasetChange: (datasetId: string) => void
}

const ChatBox: ForwardRefRenderFunction<RefProps, ChatBoxOptions> = (
  { onDatasetChange },
  ref,
) => {
  // const [pitch, setPitch] = useState('')
  // const [error, setError] = useState('')
  // const [end, setEnd] = useState('')
  // const [started, setStarted] = useState('')
  // const [results, setResults] = useState([])
  const [partialResults, setPartialResults] = useState([])
  const { Colors, Fonts } = useTheme()
  const dispatch = useAppDispatch()
  const [query, setQuery] = useState('')
  const selectedDatasetId = useAppSelector(selectDatasetId)
  const processingChatMessage = useAppSelector(selectProcessingChatMessage)
  const [sendChatMessage, { isLoading }] = useSendChatMessageMutation()
  const animatedSendScale = useRef(new Animated.Value(0)).current
  const animatedMicScale = useRef(new Animated.Value(1)).current

  const animateIcons = () => {
    if (query.length >= 1) {
      Animated.timing(animatedSendScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start(() => animatedMicScale.setValue(0))
    } else {
      Animated.timing(animatedMicScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start(() => animatedSendScale.setValue(0))
    }
  }

  useEffect(() => {
    animateIcons()
  }, [query])

  useEffect(() => {
    //Setting callbacks for the process status
    // Voice.onSpeechStart = onSpeechStart
    // Voice.onSpeechEnd = onSpeechEnd
    // Voice.onSpeechError = onSpeechError
    // Voice.onSpeechResults = onSpeechResults
    Voice.onSpeechPartialResults = onSpeechPartialResults
    // Voice.onSpeechVolumeChanged = onSpeechVolumeChanged
    return () => {
      //destroy the process after switching the screen
      Voice.destroy().then(Voice.removeAllListeners)
    }
  }, [])

  // const onSpeechStart = (e: any) => {
  //   //Invoked when .start() is called without error
  //   // console.log('onSpeechStart: ', e)
  //   setStarted('The Speech has started')
  // }

  // const onSpeechEnd = (e: any) => {
  //   //Invoked when SpeechRecognizer stops recognition
  //   // console.log('onSpeechEnd: ', e)
  //   setEnd('The Speech has ended')
  // }

  // const onSpeechError = (e: { error: any }) => {
  //   //Invoked when an error occurs.
  //   console.log('onSpeechError: ', e)
  //   setError(JSON.stringify(e.error))
  // }

  // const onSpeechResults = (e: { value: React.SetStateAction<never[]> }) => {
  //   //Invoked when SpeechRecognizer is finished recognizing
  //   // console.log('onSpeechResults: ', e)
  //   const outputVoice = e.value
  //   const finalOutputVoice = outputVoice[0]
  //   // console.log('The final output voice is ' + finalOutputVoice)
  //   setResults(e.value)
  //   // setQuery(finalOutputVoice)
  // }

  // console.log(
  //   'On speech results has trigged and the value is ' + onSpeechResults,
  // )

  const onSpeechPartialResults = (e: {
    value: React.SetStateAction<never[]>
  }) => {
    //Invoked when any results are computed
    // console.log('onSpeechPartialResults: ', e)
    setPartialResults(e.value)
    const partialOutputVoice = e.value
    const finalPartialOutputVoice = partialOutputVoice[0]
    // console.log('The final partial output voice is ' + finalPartialOutputVoice)
    setQuery(finalPartialOutputVoice)
  }

  // const onSpeechVolumeChanged = (e: {
  //   value: React.SetStateAction<string>
  // }) => {
  //   //Invoked when pitch that is recognized changed
  //   // console.log('onSpeechVolumeChanged: ', e)
  //   setPitch(e.value)
  // }

  const startRecognizing = async () => {
    //Starts listening for speech for a specific locale
    try {
      await Voice.start('en-US')
      // setPitch('')
      // setError('')
      // setStarted('')
      // setResults([])
      setPartialResults([])
      // setEnd('')
    } catch (e) {
      //eslint-disable-next-line
      // console.error(e)
    }
  }

  // const stopRecognizing = async () => {
  //   //Stops listening for speech
  //   try {
  //     await Voice.stop()
  //   } catch (e) {
  //     //eslint-disable-next-line
  //     console.error(e)
  //   }
  // }

  // const cancelRecognizing = async () => {
  //   //Cancels the speech recognition
  //   try {
  //     await Voice.cancel()
  //   } catch (e) {
  //     //eslint-disable-next-line
  //     console.error(e)
  //   }
  // }

  // const destroyRecognizer = async () => {
  //   //Destroys the current SpeechRecognizer instance
  //   try {
  //     await Voice.destroy()
  //     setPitch('')
  //     setError('')
  //     setStarted('')
  //     setResults([])
  //     setPartialResults([])
  //     setEnd('')
  //   } catch (e) {
  //     //eslint-disable-next-line
  //     console.error(e)
  //   }
  // }
  const setUtterance = (text: string) => {
    setQuery(text)
  }

  useImperativeHandle(ref, () => ({ setUtterance }))

  const makeSendRequestData = (
    datasetId: string,
    text: string,
  ): SendChatMessage => {
    return {
      session: {
        message: {
          text,
          dataSet: datasetId,
          objectID: [],
          filter: [],
          qtype: 'addfilter',
        },
        options: {
          transform: true,
          channel: 'chat',
          source: 'web',
          timezone: '-330',
        },
      },
    }
  }

  const buildFailureMessage = (resp: ResponseType<RawConverseData>) => {
    return resp.data?.status === 'failed' && resp.data?.text
      ? resp.data?.text
      : NO_DATA_AVAILABLE
  }

  const sendAndTransformResponse = async (utterance: string) => {
    if (selectedDatasetId && utterance.length) {
      const reqData = makeSendRequestData(selectedDatasetId, utterance)
      const resp = await sendChatMessage(reqData).unwrap()
      if (resp.success && resp.data) {
        dispatch(processAndAddChatMessage(resp.data))
      } else {
        const failureMessage = buildFailureMessage(resp)
        const message = makeAthenaFailureMessage(failureMessage)
        dispatch(addChatMessage(message))
      }
    }
  }

  const sendMessage = (utterance: string) => {
    // Add user message to the chat message list
    const userMessage = makeUserMessage(utterance)
    dispatch(addChatMessage(userMessage))
    sendAndTransformResponse(utterance)
  }

  const handleSendMessage = () => {
    if (query.trim().length) {
      sendMessage(query.trim())
      setQuery('')
    }
  }

  const handleSelectedFaq = (faq: string) => {
    sendMessage(faq)
  }

  return (
    <View
      style={[
        styles.chatboxWrapper,
        {
          backgroundColor: Colors.WHITE,
        },
      ]}
    >
      <DatasetChooser onSelect={onDatasetChange} />
      <TextInput
        placeholder={'Ask Athena...'}
        onChangeText={setQuery}
        onSubmitEditing={handleSendMessage}
        value={query}
        style={styles.textInput}
      />
      <FAQPicker onSelect={handleSelectedFaq} />
      <View style={[styles.faqpicker, { backgroundColor: Colors.GREEN_MAIN }]}>
        {query.length >= 1 ? (
          <Animated.View style={{ transform: [{ scale: animatedSendScale }] }}>
            <TouchableOpacity style={styles.animatedscale}>
              <Ionicon
                name="send"
                size={26}
                color={'white'}
                style={{ paddingLeft: 4 }}
                onPress={handleSendMessage}
              />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View style={{ transform: [{ scale: animatedMicScale }] }}>
            <TouchableOpacity style={styles.animatedscale}>
              <Ionicon
                name="mic-sharp"
                size={28}
                onPress={startRecognizing}
                color={'white'}
              />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  )
}

export default forwardRef(ChatBox)

const styles = StyleSheet.create({
  chatboxWrapper: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    height: 54,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: 'black',
  },
  animatedscale: {
    borderRadius: 30,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  faqpicker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
  },
})
