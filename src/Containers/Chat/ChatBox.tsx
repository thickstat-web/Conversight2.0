import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction,
} from 'react'
import { StyleSheet, TextInput } from 'react-native'
import { View, Text, TouchableOpacity } from 'react-native-ui-lib'
import { useSendChatMessageMutation } from '@/Services/modules/ingress'
import { useAppDispatch, useAppSelector, useTheme } from '@/Hooks'
import {
  processAndSetChatMessage,
  addChatMessage,
  selectProcessingChatMessage,
} from '@/Store/App'
import { selectDatasetId } from '@/Store/Auth'
import { SendChatMessage } from '@/Types/SendChatMessage'
import { UserMessage } from '@/Types/ChatMessage'
import { makeFailureAthenaMessage } from '@/Utils/chat-history-processor'
import DatasetChooser from './DatasetChooser'
import FAQPicker from './FAQPicker'
import IconButton from '@/Components/IconButton'
import SendIcon from '@/Assets/Images/iconsSVG/send.svg'

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

  const makeUserMessage = (utterance: string): UserMessage => ({
    id: `${Date.now()}`,
    message: utterance,
    isAthena: false,
  })

  const sendMessage = (utterance: string) => {
    // Add user message to the chat message list
    const userMessage = makeUserMessage(utterance)
    dispatch(addChatMessage(userMessage))
    // console.log(`[ChatBox] sendMessage text: ${utterance}`)

    const sendAndTransformResponse = async () => {
      if (selectedDatasetId && utterance.length) {
        const reqData = makeSendRequestData(selectedDatasetId, utterance)
        const resp = await sendChatMessage(reqData).unwrap()
        if (resp.success && resp.data) {
          dispatch(processAndSetChatMessage(resp.data))
        } else {
          const message = makeFailureAthenaMessage('No matching result found.')
          dispatch(addChatMessage(message))
        }
      }
    }

    sendAndTransformResponse()
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
        defaultValue={query}
        style={styles.textInput}
      />
      <FAQPicker onSelect={handleSelectedFaq} />
      <IconButton
        icon={<SendIcon />}
        loading={isLoading || processingChatMessage}
        onPress={handleSendMessage}
      />
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
  },
  textInput: {
    flex: 1,
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
  },
})
