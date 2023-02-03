import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction,
} from 'react'
import { Pressable, StyleSheet, Text, TextInput } from 'react-native'
import { View } from 'react-native-ui-lib'
import Icon from 'react-native-vector-icons/Ionicons'
import { useSendChatMessageMutation } from '@/Services/modules/ingress'
import { useAppDispatch, useAppSelector, useTheme } from '@/Hooks'
import {
  processAndAddChatMessage,
  addChatMessage,
  selectProcessingChatMessage,
} from '@/Store/App'
import { selectDatasetId } from '@/Store/Auth'
import { SendChatMessage } from '@/Types/SendChatMessage'
import {
  makeAthenaFailureMessage,
  makeUserMessage,
} from '@/Utils/chat-history-processor'
import DatasetChooser from './DatasetChooser'
import DidYouMean from './DidYouMean'
import FAQPicker from './FAQPicker'
import SendButton from './SendButton'
import { NO_DATA_AVAILABLE } from '@/Config'
import {
  AthenaResponse,
  AthenaResponseType,
  Clarification,
  RawConverseData,
} from '@/Types/ChatMessage'
import { ResponseType } from '@/Types/Common'

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
  const { Colors, Fonts } = useTheme()
  const dispatch = useAppDispatch()
  const [query, setQuery] = useState('')
  const selectedDatasetId = useAppSelector(selectDatasetId)
  const processingChatMessage = useAppSelector(selectProcessingChatMessage)
  const [sendChatMessage, { isLoading }] = useSendChatMessageMutation()
  const [didYouMeanTitle, setDidYouMeanTitle] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])

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

  const buildFailureMessage = (resp: ResponseType<AthenaResponse>) => {
    let errorMessage = NO_DATA_AVAILABLE
    const { data } = resp
    if (data?.type === AthenaResponseType.ATHENA_ERROR && !!data?.error) {
      errorMessage = data?.error
    }
    return errorMessage
  }

  const sendAndTransformResponse = async (utterance: string) => {
    if (selectedDatasetId && utterance.length) {
      const reqData = makeSendRequestData(selectedDatasetId, utterance)
      const resp = await sendChatMessage(reqData).unwrap()
      if (resp.success && resp?.data?.data) {
        if (resp?.data.type === AthenaResponseType.CLARIFICATION) {
          const clarificationData = resp.data.data as Clarification
          const { title, suggestions } = clarificationData
          setDidYouMeanTitle(title)
          setSuggestions(suggestions)
        } else {
          dispatch(processAndAddChatMessage(resp.data.data as RawConverseData))
        }
      } else {
        const failureMessage = buildFailureMessage(resp)
        const message = makeAthenaFailureMessage(failureMessage)
        dispatch(addChatMessage(message))
      }
    }
  }

  const sendMessage = (queryText: string) => {
    // Add user message to the chat message list
    // iOS fix: Replace Single/Double quotation marks(“”/‘’) with Apostrophe quote(')
    const utterance = queryText.replace(/[“”‘’]/g, "'")
    const userMessage = makeUserMessage(utterance)
    dispatch(addChatMessage(userMessage))
    sendAndTransformResponse(utterance)
  }

  const handleSendMessage = () => {
    if (query.trim().length) {
      sendMessage(query.trim())
      setQuery('')
      setSuggestions([])
    }
  }

  const handleSelectedFaq = (faq: string) => {
    sendMessage(faq)
  }

  const handleDidYouMeanAction = (utterance: string) => {
    sendMessage(utterance)
    setSuggestions([])
  }

  return (
    <View>
      {suggestions.length > 0 && (
        <DidYouMean
          title={didYouMeanTitle}
          handleSendMessage={handleDidYouMeanAction}
          list={suggestions}
        />
      )}
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
          placeholderTextColor={Colors.GRAY_DARK}
          placeholder={'Ask Athena...'}
          onChangeText={setQuery}
          onSubmitEditing={handleSendMessage}
          value={query}
          style={styles.textInput}
        />
        {query && (
          <Pressable
            style={styles.cleanButtonContainer}
            onPress={() => setQuery('')}
          >
            <Icon name={'close-circle'} size={26} color={Colors.GREEN_MAIN} />
          </Pressable>
        )}
        <FAQPicker onSelect={handleSelectedFaq} />
        <View style={{ paddingRight: 8 }}>
          <SendButton
            loading={isLoading || processingChatMessage}
            query={query}
            setQuery={setQuery}
            onPress={handleSendMessage}
          />
        </View>
      </View>
    </View>
  )
}

export default forwardRef(ChatBox)

const BUTTON_SIZE = 40
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
  cleanButtonContainer: {
    height: 26,
    width: 26,
    borderRadius: 13,
    // backgroundColor: '#02b53e',
    // backgroundColor: '#00AA39',
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
})
