import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  ForwardRefRenderFunction,
} from 'react'
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  ViewStyle,
} from 'react-native'
import { Modal, View, Text } from 'react-native-ui-lib'
import { useTranslation } from 'react-i18next'
import { useAppSelector, useTheme } from '@/Hooks'
import BackIconWhite from '@/Assets/Images/iconsSVG/back-white.svg'
import SearchIcon from '@/Assets/Images/iconsSVG/search.svg'
import SendIcon from '@/Assets/Images/iconsSVG/send.svg'
import FaqIcon from '@/Assets/Images/iconsSVG/faq.svg'
import AthenaIcon from '@/Assets/Images/iconsSVG/athena.svg'
import IconButton from '@/Components/IconButton'
import { Image } from 'react-native-ui-lib/src/components/image'
import DatasetChooser from './DatasetChooser'
import SearchContainer from './SearchContainer'
import { selectDatasetId } from '@/Store/Auth'
import { useGetChatHistoryMutation } from '@/Services/modules/bot'
import { ChatHistoryRequestData } from '@/Types/ChatHistory'
import { ChatMessage } from '@/Types/ChatMessage'

declare type AthenaChatContainerProps = {}

export declare type RefProps = {
  open: () => void
}

interface SearchOptions {
  search: boolean
  onCancel: () => void
}

interface TitlebarOptions {
  onCancel: () => void
  onDone: () => void
}

interface MessageType {
  message: string
  user?: boolean
  style?: ViewStyle
}

interface ChatboxOptions {
  onDatasetChange: (datasetId: string) => void
}

const Message = ({ user = false, message, style = {} }: MessageType) => {
  const { Colors, Fonts } = useTheme()
  return (
    <View flex row style={[user && styles.alignRight]}>
      <View style={[{ backgroundColor: Colors.WHITE }, style]}>
        <Text style={[Fonts.textRegular, styles.message]}>{message}</Text>
      </View>
    </View>
  )
}

const UserMessage = ({ message }: { message: string }) => (
  <Message message={message} style={styles.userMessageWrapper} user={true} />
)

const AthenaMessage = ({ message }: { message: string }) => (
  <View style={[styles.athenaMessageContainer]}>
    <View style={styles.athenaIcon}>
      <Image source={AthenaIcon} forwardedRef={undefined} modifiers={{}} />
    </View>
    <Message message={message} style={styles.athenaMessageWrapper} />
  </View>
)

const ChatSearch = ({ search, onCancel }: SearchOptions) => (
  <View style={styles.searchContainer}>
    {search && <SearchContainer visible={search} onCancel={onCancel} />}
  </View>
)

const TitleBar = ({ onCancel, onDone }: TitlebarOptions) => {
  const { Colors, Fonts } = useTheme()
  return (
    <Modal.TopBar
      title="Ask Athena"
      onCancel={onCancel}
      onDone={onDone}
      cancelIcon={BackIconWhite}
      doneIcon={SearchIcon}
      doneButtonProps={{
        label: '',
      }}
      titleStyle={[Fonts.text20Bold, { color: Colors.WHITE }]}
      containerStyle={[{ backgroundColor: Colors.GREEN_MAIN }]}
      includeStatusBar={false}
    />
  )
}

const ChatMessageContainer = ({ messages }: { messages: ChatMessage[] }) => (
  <View flex>
    <ScrollView>
      {messages.map((message, index) => {
        return message.isAthena ? (
          <AthenaMessage key={`${index}`} message={message.message} />
        ) : (
          <UserMessage key={`${index}`} message={message.message} />
        )
      })}
    </ScrollView>
  </View>
)

const ChatBox = ({ onDatasetChange }: ChatboxOptions) => {
  const { Colors } = useTheme()
  const [query, setQuery] = useState('')
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
      <IconButton
        icon={<FaqIcon />}
        style={[styles.faqButton, { backgroundColor: Colors.GRAY }]}
      />
      <IconButton icon={<SendIcon />} />
    </View>
  )
}

const Loading = () => {
  const { Colors } = useTheme()
  return (
    <View flex center>
      <ActivityIndicator size={'large'} color={Colors.GREEN_MAIN} />
    </View>
  )
}

const AthenaChatContainer: ForwardRefRenderFunction<
  RefProps,
  AthenaChatContainerProps
> = (props, ref) => {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [search, setSearch] = useState(false)
  const { Layout, Colors, Common, Fonts } = useTheme()

  const selectedDatasetId = useAppSelector(selectDatasetId)
  const [getChatHistory, { data, isLoading }] = useGetChatHistoryMutation()

  useEffect(() => {
    // console.log('[AthenaChatContainer] messages:', data?.data)
  }, [data])

  useEffect(() => {
    if (selectedDatasetId) {
      const reqData: ChatHistoryRequestData = {
        dataSet: selectedDatasetId,
        page: {
          from: 0,
          size: 5,
        },
      }
      getChatHistory(reqData)
    }
  }, [getChatHistory, selectedDatasetId])

  const open = () => setVisible(true)
  const close = () => setVisible(false)

  useImperativeHandle(ref, () => ({ open }))

  const handleDatasetSelection = (datasetId: string) => {
    console.log(`[ChatContainer] dataset: ${datasetId}`)
  }

  const openSearch = () => {
    setSearch(true)
  }

  const closeSearch = () => {
    setSearch(false)
  }

  return (
    <Modal
      visible={visible}
      animationType={'fade'}
      // onBackgroundPress={() => console.log('Background pressed')}
      presentationStyle={'fullScreen'}
      // transparent={false}
    >
      <SafeAreaView style={Layout.fill}>
        <View>
          <TitleBar onCancel={close} onDone={openSearch} />
          {/* Search container / overlay */}
          <ChatSearch search={search} onCancel={closeSearch} />
        </View>

        <View flex style={{ backgroundColor: Colors.GRAY }}>
          {isLoading ? (
            <Loading />
          ) : (
            <ChatMessageContainer messages={data?.data ?? []} />
          )}
          <ChatBox onDatasetChange={handleDatasetSelection} />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  searchContainer: {
    position: 'absolute',
    width: '100%',
  },
  userMessageWrapper: {
    marginRight: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    borderBottomRightRadius: 0,
  },
  athenaMessageContainer: {
    flexDirection: 'row',
    marginRight: 16,
    marginVertical: 12,
  },
  athenaIcon: {
    justifyContent: 'flex-end',
    marginLeft: 2,
    marginRight: 4,
    bottom: -16,
    width: 52,
    transform: [{ scale: 0.65 }],
  },
  athenaMessageWrapper: {
    padding: 16,
    borderRadius: 16,
    borderBottomLeftRadius: 0,
  },
  alignRight: {
    justifyContent: 'flex-end',
  },
  message: {
    lineHeight: 24,
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
  faqButton: {
    marginRight: 0,
  },
})

export default forwardRef(AthenaChatContainer)
