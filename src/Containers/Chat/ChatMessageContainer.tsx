import React, { useCallback, useEffect, useRef } from 'react'
import { FlatList, StyleSheet } from 'react-native'
import { View, Text, TouchableOpacity } from 'react-native-ui-lib'
import { Image } from 'react-native-ui-lib/src/components/image'
import { useAppDispatch, useAppSelector, useTheme } from '@/Hooks'
import { selectChatMessages, selectProcessingChatMessages } from '@/Store/App'
import {
  AthenaMessage,
  ChatMessage,
  UserMessage,
  VisualFormat,
} from '@/Types/ChatMessage'
import { LoadingSpinner } from '@/Components'
import { ColumnMetadata } from '@/Types/ChatHistory'
import TableContainer, { formatValue } from './TableContainer'
import AthenaIcon from '@/Assets/Images/iconsSVG/athena.svg'
import ChartContainer from './ChartContainer'

interface TextFormat {
  columns: string[]
  columnMetadata: ColumnMetadata
  value: string
}

const FailureMessageContainer = ({ message }: { message: string }) => {
  const { Fonts } = useTheme()
  return (
    <Text margin-4 style={[Fonts.textSmall, styles.message]}>
      {message}
    </Text>
  )
}

const TextContainer = ({ columns, columnMetadata, value }: TextFormat) => {
  const { Fonts } = useTheme()
  const formattedValue = formatValue(columns, columnMetadata)(value, 0)
  return (
    <Text margin-4 style={[Fonts.textSmall, styles.message]}>
      {formattedValue}
    </Text>
  )
}

const resolveVisualization = (
  id: string,
  visualFormats: VisualFormat[],
  columns: string[],
  columnMetadata: ColumnMetadata,
  values: Record<string, any>[],
  message: string,
) => {
  // console.log(
  //   `[ChartMessageContainer] visual formats: ${JSON.stringify(
  //     visualFormats,
  //     null,
  //     2,
  //   )}`,
  // )
  let content = null
  if (visualFormats.find(item => item.type === 'Error')) {
    if (values.length === 1) {
      const [[, value]] = Object.entries(values[0])
      content = <FailureMessageContainer message={`${value}`} />
    }
  } else if (
    visualFormats.length === 0 ||
    visualFormats.find(item => item.type === 'Text')
  ) {
    if (values.length === 1) {
      const [[, value]] = Object.entries(values[0])
      content = (
        <TextContainer
          columns={columns}
          columnMetadata={columnMetadata}
          value={`${value}`}
        />
      )
    } else {
      console.warn(
        `[VisualFormat] text & more values: ${JSON.stringify(values, null, 2)}`,
      )
    }
  } else if (visualFormats.find(item => item.type.indexOf('Chart') !== -1)) {
    content = (
      <ChartContainer
        key={id}
        columns={columns}
        columnMetadata={columnMetadata}
        visualFormats={visualFormats}
        values={values.slice(0, 50)}
        title={message}
      />
    )
  } else if (visualFormats.find(item => item.type === 'Table')) {
    content = (
      <TableContainer
        columns={columns}
        columnMetadata={columnMetadata}
        values={values.slice(0, 220)}
      />
    )
  } else {
    console.log(
      `[VisualFormat] visual formats not matched: ${JSON.stringify(
        visualFormats,
        null,
        2,
      )}`,
    )
  }
  return content
}

interface UserMessageContainerProps {
  message: UserMessage
  onPress: (text: string) => void
}

const UserMessageContainer = React.memo(
  ({ message, onPress }: UserMessageContainerProps) => {
    const { Colors, Fonts } = useTheme()
    const { message: utterance } = message
    return (
      <View flex row style={styles.alignRight}>
        <TouchableOpacity
          style={[
            { backgroundColor: Colors.GREEN_LIGHTEST },
            styles.userMessageWrapper,
          ]}
          onPress={() => onPress(utterance.trim())}
        >
          <Text
            style={[
              Fonts.textSmall,
              styles.message,
              { color: Colors.GREEN_MAIN },
            ]}
          >
            {utterance}
          </Text>
        </TouchableOpacity>
      </View>
    )
  },
)

const AthenaMessageContainer = React.memo(
  ({ message }: { message: AthenaMessage }) => {
    const {
      id,
      columns,
      columnMetadata,
      data,
      message: title,
      visualFormats,
    } = message
    const { Colors, Fonts } = useTheme()
    return (
      <View style={styles.athenaMessageContainer}>
        <View style={styles.athenaIcon}>
          <Image source={AthenaIcon} forwardedRef={undefined} modifiers={{}} />
        </View>
        <View flex left>
          <View
            style={[
              { backgroundColor: Colors.WHITE },
              styles.athenaMessageWrapper,
            ]}
          >
            <View marginV-12>
              {resolveVisualization(
                id,
                visualFormats,
                columns,
                columnMetadata,
                data,
                title,
              )}
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
  ({ item: message }: { item: ChatMessage }) => {
    return message.isAthena ? (
      <AthenaMessageContainer
        key={message.id}
        message={message as AthenaMessage}
      />
    ) : (
      <UserMessageContainer
        key={message.id}
        message={message}
        onPress={onTapMessage}
      />
    )
  }

const ChatMessageContainer = ({
  isLoading,
  onTapMessage,
}: ChatMessageContainerProps) => {
  let messageListRef = useRef()
  const chatMessagesProcessing = useAppSelector(selectProcessingChatMessages)
  const messages = useAppSelector(selectChatMessages)

  // useEffect(() => {
  //   console.log('[ChatMessageContainer] rendering...')
  // })

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
    paddingHorizontal: 12,
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
