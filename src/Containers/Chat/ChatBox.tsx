import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction,
} from 'react'
import { Pressable, StyleSheet, TextInput } from 'react-native'
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
import FAQPicker from './FAQPicker'
import SendButton from './SendButton'
import { NO_DATA_AVAILABLE } from '@/Config'
import { RawConverseData } from '@/Types/ChatMessage'
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
        placeholderTextColor={'#00AA39'}
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
