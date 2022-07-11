import React, { useRef } from 'react'
import { FlatList, StyleSheet } from 'react-native'
import { Modal, View, Text } from 'react-native-ui-lib'
import { useTheme } from '@/Hooks'
import { Image } from 'react-native-ui-lib/src/components/image'
import {
  AthenaMessage,
  ChatMessage,
  UserMessage,
  VisualFormat,
} from '@/Types/ChatMessage'
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
  visualFormats: VisualFormat[],
  columns: string[],
  columnMetadata: ColumnMetadata,
  values: Array<Record<string, any>[]>,
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
  } else if (visualFormats.find(item => item.type === 'Text')) {
    if (values.length === 1) {
      const [[, value]] = Object.entries(values[0])
      content = (
        <TextContainer
          columns={columns}
          columnMetadata={columnMetadata}
          value={`${value}`}
        />
      )
    }
  } else if (visualFormats.find(item => item.type.indexOf('Chart') !== -1)) {
    // console.log(
    //   `[VisualFormat] chart values: ${JSON.stringify(values, null, 2)}`,
    // )
    content = (
      <ChartContainer
        columns={columns}
        columnMetadata={columnMetadata}
        visualFormats={visualFormats}
        values={values.slice(0, 50)}
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
  }
  return content
}

const UserMessageContainer = ({ message }: { message: UserMessage }) => {
  const { Colors, Fonts } = useTheme()
  const { message: utterance } = message
  return (
    <View flex row style={styles.alignRight}>
      <View
        style={[{ backgroundColor: Colors.WHITE }, styles.userMessageWrapper]}
      >
        <Text style={[Fonts.textSmall, styles.message]}>{utterance}</Text>
      </View>
    </View>
  )
}

const AthenaMessageContainer = ({ message }: { message: AthenaMessage }) => {
  const { columns, columnMetadata, data, visualFormats } = message
  const { Colors, Fonts } = useTheme()
  return (
    <View style={styles.athenaMessageContainer}>
      <View style={styles.athenaIcon}>
        <Image source={AthenaIcon} forwardedRef={undefined} modifiers={{}} />
      </View>
      <View flex>
        <View
          style={[
            { backgroundColor: Colors.WHITE },
            styles.athenaMessageWrapper,
          ]}
        >
          <View marginV-12>
            {resolveVisualization(visualFormats, columns, columnMetadata, data)}
          </View>
        </View>
      </View>
    </View>
  )
}

const ChatMessageContainer = ({ messages }: { messages: ChatMessage[] }) => {
  let messageListRef = useRef()
  return (
    <View flex>
      {/* {messages.map((message, index) => {
      return message.isAthena ? (
        <AthenaMessageContainer
          key={`${index}`}
          message={message as AthenaMessage}
        />
      ) : (
        <UserMessageContainer key={`${index}`} message={message} />
      )
    })} */}
      <FlatList
        data={messages}
        ref={ref => (messageListRef = ref)}
        onLayout={() => {
          messageListRef.scrollToEnd({ animated: false })
        }}
        onContentSizeChange={() => {
          messageListRef.scrollToEnd({ animated: true })
        }}
        keyExtractor={(item, _) => item.id}
        renderItem={({ item: message, index }) => {
          return message.isAthena ? (
            <AthenaMessageContainer
              key={`${message.id}`}
              message={message as AthenaMessage}
            />
          ) : (
            <UserMessageContainer key={`${message.id}`} message={message} />
          )
        }}
      />
    </View>
  )
}

export default ChatMessageContainer

const styles = StyleSheet.create({
  userMessageWrapper: {
    marginRight: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    borderBottomRightRadius: 0,
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
    flex: 1,
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
