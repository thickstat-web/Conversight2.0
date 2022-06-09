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
import BackIcon from '@/Assets/Images/iconsSVG/back.svg'
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

interface MessageType {
  user?: boolean
  message: string
  style?: ViewStyle
}

declare type AthenaChatContainerProps = {}

export declare type RefProps = {
  open: () => void
}

const AthenaChatContainer: ForwardRefRenderFunction<
  RefProps,
  AthenaChatContainerProps
> = (props, ref) => {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [search, setSearch] = useState(false)
  const { Gutters, Layout, Colors, Common, Fonts } = useTheme()

  const selectedDatasetId = useAppSelector(selectDatasetId)
  const [getChatHistory, { data, isLoading, isSuccess }] =
    useGetChatHistoryMutation()

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

  const Message = ({ user, message, style }: MessageType) => (
    <View flex row style={[user && styles.alignRight]}>
      <View style={[{ backgroundColor: Colors.WHITE }, style]}>
        <Text style={[Fonts.textRegular, styles.message]}>{message}</Text>
      </View>
    </View>
  )

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

  const ChatSearch = () => (
    <View style={styles.searchContainer}>
      {search && <SearchContainer visible={search} onCancel={closeSearch} />}
    </View>
  )

  const TitleBar = () => (
    <Modal.TopBar
      title="Ask Athena"
      onCancel={close}
      onDone={openSearch}
      cancelIcon={BackIcon}
      doneIcon={SearchIcon}
      doneButtonProps={{
        label: '',
      }}
      titleStyle={[Fonts.text20Bold, { color: Colors.WHITE }]}
      containerStyle={[{ backgroundColor: Colors.GREEN_MAIN }]}
    />
  )

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

  const ChatBox = () => {
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
        <DatasetChooser onSelect={handleDatasetSelection} />
        <TextInput
          placeholder={'Ask Athena...'}
          onChangeText={setQuery}
          // value={query}
          defaultValue={query}
          style={styles.textInput}
        />
        <IconButton
          icon={<FaqIcon />}
          style={{ backgroundColor: Colors.GRAY }}
        />
        <IconButton icon={<SendIcon />} />
      </View>
    )
  }

  const Loading = () => (
    <View flex center>
      <ActivityIndicator size={'large'} color={Colors.GREEN_MAIN} />
    </View>
  )

  return (
    <SafeAreaView style={Layout.fill}>
      <Modal
        visible={visible}
        animationType={'fade'}
        // onBackgroundPress={() => console.log('Background pressed')}
        presentationStyle={'fullScreen'}
        transparent={false}
      >
        <View>
          <TitleBar />
          {/* Search container / overlay */}
          <ChatSearch />
        </View>

        <View flex style={{ backgroundColor: Colors.GRAY }}>
          {isLoading ? (
            <Loading />
          ) : (
            <ChatMessageContainer messages={data?.data ?? []} />
          )}
          <ChatBox />
        </View>
      </Modal>
    </SafeAreaView>
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
    height: 60,
    borderRadius: 32,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Montserrat-Regular',
    fontSize: 18,
  },
})

export default forwardRef(AthenaChatContainer)
