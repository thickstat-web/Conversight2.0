import React, { useRef, useState } from 'react'
import { FlatList, StyleSheet } from 'react-native'
import { View, Text, TouchableOpacity } from 'react-native-ui-lib'
import { Image } from 'react-native-ui-lib/src/components/image'
import { useAppSelector, useTheme } from '@/Hooks'
import { selectChatMessages, selectProcessingChatMessages } from '@/Store/App'
import { ChatMessage, ConverseData, MessageType } from '@/Types/ChatMessage'
import { LoadingSpinner } from '@/Components'
import AthenaIcon from '@/Assets/Images/iconsSVG/athena.svg'
import { NO_DATA_AVAILABLE } from '@/Config'
import { navigate } from '@/Navigators/utils'
import { DATA_EXPLORER } from '@/Constants/screens'
import { ChatVisualizer } from '@/Components/Visualization'

interface UserMessageContainerProps {
  message: string
  onPress: (text: string) => void
}

const UserMessageContainer = React.memo(
  ({ message, onPress }: UserMessageContainerProps) => {
    const { Colors, Fonts } = useTheme()
    return (
      <View flex row style={styles.alignRight}>
        <TouchableOpacity
          style={[
            { backgroundColor: Colors.GREEN_LIGHTEST },
            styles.userMessageWrapper,
          ]}
          onPress={() => onPress(message.trim())}
        >
          <Text
            style={[
              Fonts.textSmall,
              styles.message,
              { color: Colors.GREEN_MAIN },
            ]}
          >
            {message}
          </Text>
        </TouchableOpacity>
      </View>
    )
  },
)

export const FailureMessageContainer = ({ message }: { message: string }) => {
  const { Fonts } = useTheme()
  return (
    <Text margin-4 style={[Fonts.textSmall, styles.message]}>
      {message}
    </Text>
  )
}

const AthenaMessageContainer = React.memo(
  ({ message }: { message: ConverseData }) => {
    const { Colors } = useTheme()
    const [move, setMove] = useState(false)

    return (
      <View style={styles.athenaMessageContainer}>
        <View style={styles.athenaIcon}>
          <Image source={AthenaIcon} forwardedRef={undefined} modifiers={{}} />
        </View>
        <View flex left>
          <View
            style={[
              styles.athenaMessageWrapper,
              { backgroundColor: Colors.WHITE },
            ]}
          >
            <View
              marginV-8
              onTouchStart={() => setMove(false)}
              onTouchMove={() => setMove(true)}
              onTouchEnd={() => {
                navigate(DATA_EXPLORER, { id: message.id })
                if (!move) {
                  // navigate(DATA_EXPLORER, { id: message.id })
                  // console.log(
                  //   `visualFormats: ${JSON.stringify(visualFormats, null, 2)}
                  // \ncolumns: ${JSON.stringify(columns, null, 2)}
                  // \ncolumnMetadata: ${JSON.stringify(columnMetadata, null, 2)}
                  // \nvalue: ${value}
                  // \nvalues: ${JSON.stringify(values, null, 2)}
                  // `,
                  // )
                }
              }}
            >
              <ChatVisualizer data={message} />
            </View>
          </View>
        </View>
      </View>
    )
  },
)

interface ChatMessageContainerProps {
  isLoading: boolean
  onTapMessage: (text: string) => void
}

const renderItem =
  (onTapMessage: (text: string) => void) =>
  ({ item }: { item: ChatMessage }) => {
    const { id, type, message } = item
    let component = null
    if (type === MessageType.USER) {
      component = (
        <UserMessageContainer
          key={id}
          message={message as string}
          onPress={onTapMessage}
        />
      )
    } else if (type === MessageType.ATHENA) {
      component = (
        <AthenaMessageContainer key={id} message={message as ConverseData} />
      )
    } else {
      component = <FailureMessageContainer message={NO_DATA_AVAILABLE} />
    }
    return component
  }

const ChatMessageContainer = ({
  isLoading,
  onTapMessage,
}: ChatMessageContainerProps) => {
  let messageListRef = useRef()
  const chatMessagesProcessing = useAppSelector(selectProcessingChatMessages)
  const messages = useAppSelector(selectChatMessages)

  const setMessageListRef = ref => (messageListRef = ref)
  const keyExtractor = (item: ChatMessage) => item.id

  const scrollToEnd =
    (animated: boolean = true) =>
    () =>
      messageListRef?.scrollToEnd({ animated })

  return (
    <View flex>
      {chatMessagesProcessing || isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={messages}
          ref={setMessageListRef}
          onLayout={scrollToEnd(false)}
          onContentSizeChange={scrollToEnd()}
          keyExtractor={keyExtractor}
          renderItem={renderItem(onTapMessage)}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

export default React.memo(ChatMessageContainer)

const styles = StyleSheet.create({
  userMessageWrapper: {
    marginRight: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderColor: '#d8f6d8',
  },
  athenaMessageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
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
    // flex: 1,
    // overflow: 'scroll',
    paddingHorizontal: 8,
    borderRadius: 16,
    borderBottomLeftRadius: 0,
  },
  alignRight: {
    justifyContent: 'flex-end',
  },
  message: {
    fontSize: 14,
    lineHeight: 24,
  },
})
