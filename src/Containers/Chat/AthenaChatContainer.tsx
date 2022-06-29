import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  ForwardRefRenderFunction,
} from 'react'
import { SafeAreaView, StyleSheet, TextInput } from 'react-native'
import { Modal, Picker, PickerValue, Text, View } from 'react-native-ui-lib'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector, useTheme } from '@/Hooks'
import IconButton from '@/Components/IconButton'
import BackIconWhite from '@/Assets/Images/iconsSVG/back-white.svg'
import SearchIcon from '@/Assets/Images/iconsSVG/search.svg'
import CloseIcon from '@/Assets/Images/iconsSVG/close.svg'
import SendIcon from '@/Assets/Images/iconsSVG/send.svg'
import FaqIcon from '@/Assets/Images/iconsSVG/faq.svg'
import RadioIcon from '@/Assets/Images/iconsSVG/radio.svg'
import RadioSelectedIcon from '@/Assets/Images/iconsSVG/radio-selected.svg'
import DatasetChooser from './DatasetChooser'
// import SearchContainer from './SearchContainer'
import { selectDatasetId } from '@/Store/Auth'
import {
  selectChatMessages,
  processAndSetChatHistory,
  selectProcessingChatMessages,
  processAndSetChatMessage,
  addChatMessage,
  selectProcessingChatMessage,
} from '@/Store/App'
import { useGetChatHistoryMutation } from '@/Services/modules/bot'
import { useSendChatMessageMutation } from '@/Services/modules/ingress'
import { ChatHistoryRequestData } from '@/Types/ChatHistory'
import ChatMessageContainer from './ChatMessageContainer'
import { LoadingSpinner } from '@/Components'
import { SendChatMessage } from '@/Types/SendChatMessage'
import { UserMessage } from '@/Types/ChatMessage'
import { makeFailureAthenaMessage } from '@/Utils/chat-history-processor'
import { CHAT_FAQ } from '@/Constants/screens'
import { Navigation, NavigationProps } from '@/Types/Common'
import FAQPicker from './FAQPicker'

export declare type RefProps = {
  open: () => void
}

// interface SearchOptions {
//   search: boolean
//   onCancel: () => void
// }

// interface TitlebarOptions {
//   onCancel: () => void
//   onDone: () => void
// }

interface ChatboxOptions {
  navigation: Navigation
  onDatasetChange: (datasetId: string) => void
}

// const ChatSearch = ({ search, onCancel }: SearchOptions) => (
//   <View style={styles.searchContainer}>
//     {search && <SearchContainer visible={search} onCancel={onCancel} />}
//   </View>
// )

// const TitleBar = ({ onCancel, onDone }: TitlebarOptions) => {
//   const { Colors, Fonts } = useTheme()
//   return (
//     <Modal.TopBar
//       title="Ask Athena"
//       onCancel={onCancel}
//       onDone={onDone}
//       cancelIcon={BackIconWhite}
//       doneIcon={SearchIcon}
//       doneButtonProps={{
//         label: '',
//       }}
//       titleStyle={[Fonts.text20Bold, { color: Colors.WHITE }]}
//       containerStyle={[{ backgroundColor: Colors.GREEN_MAIN }]}
//       includeStatusBar={false}
//     />
//   )
// }

const ChatBox = ({ onDatasetChange }: ChatboxOptions) => {
  const { Colors, Fonts } = useTheme()
  const dispatch = useAppDispatch()
  const [query, setQuery] = useState('')
  const selectedDatasetId = useAppSelector(selectDatasetId)
  const processingChatMessage = useAppSelector(selectProcessingChatMessage)
  const [sendChatMessage, { isLoading }] = useSendChatMessageMutation()

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
    sendMessage(query.trim())
    setQuery('')
  }

  const handleSelectedFaq = (faq: string) => {
    console.log(`[AthenaChatContainer] selected faq: ${faq}`)
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
        // value={query}
        defaultValue={query}
        style={styles.textInput}
      />
      <FAQPicker onSelect={handleSelectedFaq} />
      {/* <IconButton
        icon={<FaqIcon />}
        style={[styles.faqButton, { backgroundColor: Colors.GRAY }]}
        onPress={openFaq}
      /> */}
      <IconButton
        icon={<SendIcon />}
        loading={isLoading || processingChatMessage}
        onPress={handleSendMessage}
      />
    </View>
  )
}

const AthenaChatContainer = props => {
  const { navigation, route } = props
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [visible, setVisible] = useState(false)
  const [search, setSearch] = useState(false)
  const { Layout, Colors, Common, Fonts } = useTheme()

  const selectedDatasetId = useAppSelector(selectDatasetId)
  const chatMessagesProcessing = useAppSelector(selectProcessingChatMessages)
  const chatMessages = useAppSelector(selectChatMessages)
  const [getChatHistory, { isLoading }] = useGetChatHistoryMutation()

  useEffect(() => {
    console.log(
      `[AthenaChatContainer] prosp: ${JSON.stringify(props, null, 2)}`,
    )
  })

  useEffect(() => {
    if (selectedDatasetId) {
      const reqData: ChatHistoryRequestData = {
        dataSet: selectedDatasetId,
        page: {
          from: 0,
          size: 10,
        },
      }
      const fetchChatHistory = async () => {
        const resp = await getChatHistory(reqData).unwrap()
        dispatch(processAndSetChatHistory(resp.data || []))
      }

      fetchChatHistory()
    }
  }, [dispatch, getChatHistory, selectedDatasetId])

  // const open = () => setVisible(true)
  // const close = () => setVisible(false)

  // useImperativeHandle(ref, () => ({ open }))

  const handleDatasetSelection = (datasetId: string) => {
    console.log(`[ChatContainer] dataset: ${datasetId}`)
  }

  // const openSearch = () => {
  //   setSearch(true)
  // }

  // const closeSearch = () => {
  //   setSearch(false)
  // }

  return (
    // <Modal
    //   visible={true}
    //   animationType={'fade'}
    //   // onBackgroundPress={() => console.log('Background pressed')}
    //   presentationStyle={'fullScreen'}
    //   // transparent={true}
    // >
    <SafeAreaView style={[Layout.fill, { backgroundColor: Colors.GREEN_MAIN }]}>
      {/* <View>
        <TitleBar onCancel={close} onDone={openSearch} /> */}
      {/* Search container / overlay */}
      {/* <ChatSearch search={search} onCancel={closeSearch} />
      </View> */}

      <View flex style={{ backgroundColor: Colors.GRAY }}>
        {chatMessagesProcessing || isLoading ? (
          <LoadingSpinner />
        ) : (
          <ChatMessageContainer messages={chatMessages} />
        )}
        <ChatBox
          navigation={navigation}
          onDatasetChange={handleDatasetSelection}
        />
      </View>
    </SafeAreaView>
    // </Modal>
  )
}

const styles = StyleSheet.create({
  searchContainer: {
    position: 'absolute',
    width: '100%',
  },
  chatboxWrapper: {
    flexDirection: 'row',
    // justifyContent: 'center',
    // alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    height: 54,
    borderRadius: 32,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Montserrat-Regular',
    fontSize: 18,
  },
  // faqButton: {
  //   marginRight: 0,
  // },
  // item: {
  //   marginVertical: 4,
  //   marginHorizontal: 16,
  //   paddingVertical: 16,
  //   paddingHorizontal: 24,
  //   borderRadius: 8,
  // },
  // optionLabel: {
  //   marginRight: 12,
  // },
})

// export default forwardRef(AthenaChatContainer)
export default AthenaChatContainer
