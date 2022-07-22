import React, { useRef, useState } from 'react'
import { FlatList, Pressable, StyleSheet } from 'react-native'
import { View, Text, TouchableOpacity, Colors } from 'react-native-ui-lib'
import { Image } from 'react-native-ui-lib/src/components/image'
import { useAppDispatch, useAppSelector, useTheme } from '@/Hooks'
import { selectChatMessages, selectProcessingChatMessages } from '@/Store/App'
import {
  AthenaMessage,
  ChartType,
  ChatMessage,
  UserMessage,
  VisualFormat,
} from '@/Types/ChatMessage'
import { LoadingSpinner } from '@/Components'
import { ColumnMetadata } from '@/Types/ChatHistory'
import TableContainer from './TableContainer'
import AthenaIcon from '@/Assets/Images/iconsSVG/athena.svg'
import ChartContainer from './ChartContainer'
import { NO_DATA_AVAILABLE } from '@/Config'
import { navigate } from '@/Navigators/utils'
import { DATA_EXPLORER } from '@/Constants/screens'

const FailureMessageContainer = ({ message }: { message: string }) => {
  const { Fonts } = useTheme()
  return (
    <Text margin-4 style={[Fonts.textSmall, styles.message]}>
      {message}
    </Text>
  )
}

const TextContainer = ({ value }: { value: string }) => {
  const { Fonts } = useTheme()
  return (
    <Text
      margin-4
      style={[Fonts.textSmall, styles.message]}
      selectable={true}
      selectionColor={Colors.GREEN_LIGHTEST}
    >
      {value}
    </Text>
  )
}

const getPreferredChart = (
  visualFormats: VisualFormat[],
  utterance: string,
  values: Record<string, any>[],
  visualFormatIncludes: (chart: string) => boolean,
) => {
  let preferredChart: ChartType | null =
    (visualFormats.find(item => item.type.indexOf('Chart') !== -1)
      ?.type as ChartType) ?? null
  const query = utterance?.toLowerCase()
  if (
    values.length <= 10 &&
    (query.includes('top') || query.includes('bottom')) &&
    visualFormatIncludes('PieChart')
  ) {
    preferredChart = 'PieChart'
  } else if (
    values.length > 10 &&
    values.length < 100 &&
    visualFormatIncludes('ColumnChart')
  ) {
    preferredChart = 'ColumnChart'
  } else if (
    (values.length > 1 || query.includes('compare')) &&
    visualFormatIncludes('LineChart')
  ) {
    preferredChart = 'LineChart'
  } else if (query.includes('compare') && visualFormatIncludes('AreaChart')) {
    preferredChart = 'AreaChart'
    // } else if (visualFormatIncludes('DualAxes')) {
    //   preferredChart = 'DualAxes'
  }
  return preferredChart
}

const resolveVisualization = (
  id: string,
  visualFormats: VisualFormat[],
  columns: string[],
  columnMetadata: ColumnMetadata,
  value: string,
  values: Record<string, any>[],
  utterance: string,
  message: string,
) => {
  const visualFormatIncludes = (chart: string) => {
    return !!visualFormats.find(item => item.type.indexOf(chart) !== -1)
  }

  let content = null
  if (visualFormats.find(item => item.type === 'Error')) {
    content = <FailureMessageContainer message={NO_DATA_AVAILABLE} />
  } else if (
    visualFormats.length === 0 ||
    visualFormats.find(item => item.type === 'Text' || values.length === 0)
  ) {
    content = <TextContainer value={value} />
  } else if (visualFormatIncludes('Chart') && values.length < 100) {
    let preferredChart: ChartType | null = getPreferredChart(
      visualFormats,
      utterance,
      values,
      visualFormatIncludes,
    )

    content = (
      <ChartContainer
        key={id}
        preferredChart={preferredChart}
        columns={columns}
        columnMetadata={columnMetadata}
        visualFormats={visualFormats}
        values={values}
        title={message}
      />
    )
  } else if (visualFormatIncludes('Table')) {
    content = (
      <TableContainer
        columns={columns}
        columnMetadata={columnMetadata}
        values={values.slice(0, 5)}
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
      value,
      values,
      message: title,
      utterance,
      visualFormats,
    } = message
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
                if (!move) {
                  navigate(DATA_EXPLORER, { id })

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
              {resolveVisualization(
                id,
                visualFormats,
                columns,
                columnMetadata,
                value,
                values,
                utterance,
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
