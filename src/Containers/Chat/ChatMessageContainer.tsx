import {
  AthenaResponse,
  ChatMessage,
  ConverseData,
  MessageType,
  Rerequest,
} from '@/Types/ChatMessage'
import { ChatVisualizer, LayoutNoInternet, LoadingSpinner } from '@/Components'
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native-ui-lib'
import {
  addChatMessage,
  selectChatMessages,
  selectProcessingChatMessages,
} from '@/Store/App'
import { useAppSelector, useTheme } from '@/Hooks'

import AthenaIcon from '@/Assets/Images/iconsSVG/athena.svg'
import { Clarification } from '@/Types/ChatMessage'
import { ReRequest } from '@/Types/SendChatMessage'
import { DATA_EXPLORER } from '@/Constants/screens'
import FollowUpQuestions from './FollowUpQuestions'
import { Image } from 'react-native-ui-lib/src/components/image'
import { ResponseType } from '@/Types/Common'
import { makeUserMessage } from '@/Utils/chat-history-processor'
import { navigate } from '@/Navigators/utils'
import { selectDatasetId } from '@/Store/Auth'
import { useGetDatasetsQuery } from '@/Services/modules/chat'
import moment from 'moment'
import { getDatasetInfo } from '@/Utils/common'
import { useNetInfo } from '@react-native-community/netinfo'

interface UserMessageContainerProps {
  message: string
  onPress: (text: string) => void
}

const { width: screenWidth } = Dimensions.get('screen')

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

export const FailureMessageContainer = ({
  message,
}: {
  message: ConverseData
}) => {
  const { Colors, Fonts } = useTheme()
  return (
    <View style={styles.athenaMessageContainer}>
      <View style={styles.athenaIcon}>
        <Image
          source={AthenaIcon}
          forwardedRef={undefined}
          modifiers={undefined}
        />
      </View>
      <View flex left>
        <View
          style={[
            styles.athenaMessageWrapper,
            { backgroundColor: Colors.WHITE },
          ]}
        >
          <Text margin-8 marginV-12 style={[Fonts.textSmall, styles.message]}>
            {message}
          </Text>
        </View>
      </View>
    </View>
  )
}

type DidYouMeanProps = {
  sendMessage: (utterance: string) => void
  message: Clarification
}

const AthenaDidYouMeanContainer = ({
  message,
  sendMessage: sendMessage,
}: DidYouMeanProps) => {
  const { Colors } = useTheme()

  const renderedItems = message.suggestions.map((item, index) => (
    <Pressable
      key={index}
      style={[
        styles.athenaDidYouMean,
        {
          borderColor: Colors.GREEN_LIGHT,
          backgroundColor: Colors.GREEN_LIGHTEST,
        },
      ]}
      onPress={() => sendMessage(item)}
    >
      <Text style={{ color: Colors.GREEN_MAIN }}>{item}</Text>
    </Pressable>
  ))

  return (
    <View style={styles.athenaMessageContainer}>
      <View style={styles.athenaIcon}>
        <Image source={AthenaIcon} />
      </View>
      <View>
        <View
          style={[
            styles.athenaMessageWrapper,
            { backgroundColor: Colors.WHITE },
          ]}
        >
          <View style={styles.athenaDidYouMeanContainer}>
            <Text
              style={[
                styles.athenaDidYouMeanText,
                {
                  color: Colors.GREEN_DARK,
                },
              ]}
            >
              {message.title}
            </Text>
            <Text style={{ color: Colors.GREEN_DARK }}>
              Tap from the below item(s),
            </Text>
          </View>
          <View style={styles.didYouMeanRenderedItems}>{renderedItems}</View>
        </View>
      </View>
    </View>
  )
}

type AthenaReRequestProps = {
  message: ReRequest
}
const AthenaReRequestContainer = ({ message }: AthenaReRequestProps) => {
  const { Colors } = useTheme()

  const questionTitle = JSON.stringify(message.title)
  const questionText = JSON.stringify(message.question)
  const formattedQuestionText = questionText.replace(/"/g, '')
  const formattedQuestionTitle = questionTitle.replace(/"/g, '')

  return (
    <View style={styles.athenaMessageContainer}>
      <View style={styles.athenaIcon}>
        <Image source={AthenaIcon} />
      </View>
      <View
        style={[styles.athenaMessageWrapper, { backgroundColor: Colors.WHITE }]}
      >
        <View style={styles.athenaDidYouMeanContainer}>
          <Text
            style={{
              color: Colors.GREEN_DARK,
              fontWeight: 'bold',
            }}
          >
            {formattedQuestionTitle}
          </Text>
          <Text
            style={[
              { paddingHorizontal: 10 },
              {
                color: Colors.GREEN_DARK,
              },
            ]}
          >
            {formattedQuestionText}
          </Text>
        </View>
      </View>
    </View>
  )
}

const AthenaMessageContainer = React.memo(
  ({ message }: { message: ConverseData }) => {
    const { Colors } = useTheme()
    const [move, setMove] = useState(false)

    const isDataEmpty = message.visualFormats.length === 0
    return (
      <View style={styles.athenaMessageContainer}>
        <View style={styles.athenaIcon}>
          <Image source={AthenaIcon} forwardedRef={undefined} modifiers={{}} />
        </View>
        {/* 
                // console.log(
                //   `visualFormats: ${JSON.stringify(
                //     message.visualFormats,
                //     null,
                //     2,
                //   )}
                //   \ncolumns: ${JSON.stringify(message.columns, null, 2)}
                //   \ncolumnMetadata: ${JSON.stringify(
                //     message.columnMetadata,
                //     null,
                //     2,
                //   )}
                //   \nvalue: ${message.message}
                //   \nvalues: ${JSON.stringify(message.values, null, 2)}
                //   \ntext data: ${JSON.stringify(message.textData, null, 2)}
                //   `,
                // )
            > */}
        <View
          style={[
            styles.athenaMessageWrapper,
            {
              backgroundColor: Colors.WHITE,
              padding: 4,
            },
          ]}
          onTouchStart={() => setMove(false)}
          onTouchMove={() => setMove(true)}
          onTouchEnd={() => {
            if (Platform.OS === 'android' || !move) {
              !isDataEmpty &&
                navigate(DATA_EXPLORER, {
                  id: message.id,
                  title: message.message,
                })
            }
          }}
        >
          <ChatVisualizer
            data={message}
            enableChartPreview={false}
            enableResetButton={false}
          />
        </View>
      </View>
    )
  },
)

interface ChatMessageContainerProps {
  isLoading: boolean
  onTapMessage: (text: string) => void
  onTapDidYouMean: (text: string) => void
}

const renderItem =
  (
    onTapMessage: (text: string) => void,
    onTapDidYouMean: (text: string) => void,
  ) =>
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
    } else if (type === MessageType.ATHENA_DID_YOU_MEAN) {
      component = (
        <AthenaDidYouMeanContainer
          key={id}
          message={message as Clarification}
          sendMessage={onTapDidYouMean}
        />
      )
    } else if (type === MessageType.ATHENA_REREQUEST) {
      component = (
        <AthenaReRequestContainer key={id} message={message as Rerequest} />
      )
    } else {
      component = <FailureMessageContainer message={message as ConverseData} />
    }
    return component
  }

const ChatMessageContainer = ({
  isLoading,
  onTapMessage,
  onTapDidYouMean,
}: ChatMessageContainerProps) => {
  const { Colors, Fonts } = useTheme()
  const { data } = useGetDatasetsQuery()
  const dataSets = data?.data || []
  const messageListRef = useRef<FlatList<ChatMessage[]>>()
  const chatMessagesProcessing = useAppSelector(selectProcessingChatMessages)
  const messages = useAppSelector(selectChatMessages)
  const selectedDatasetId = useAppSelector(selectDatasetId)

  const keyExtractor = (item: ChatMessage) => item.id

  const datasetInfo = getDatasetInfo(dataSets, selectedDatasetId, moment)

  const scrollToEnd =
    (animated: boolean = true) =>
    () =>
      setTimeout(() => messageListRef?.current?.scrollToEnd({ animated }), 800)

  const NoHistory = (
    <View
      flex
      center
      margin-24
      marginT-150
      padding-16
      style={{
        borderWidth: 1,
        borderColor: Colors.GREEN_MAIN,
        borderRadius: 8,
        backgroundColor: Colors.NOTIFICATION_GREEN,
      }}
    >
      <Text
        style={[
          Fonts.textRegular,
          { fontWeight: 'bold', color: Colors.GREEN_MAIN, paddingTop: 4 },
        ]}
      >
        No chat history exists.
      </Text>
      <Text style={[Fonts.textSmall, { marginTop: 16, lineHeight: 24 }]}>
        Start a new chat or try switch other dataset if exists
      </Text>
    </View>
  )
  const { isConnected } = useNetInfo()
  return (
    <View flex>
      <View>
        {!isConnected && (
          <View style={{ height: 30 }}>
            <LayoutNoInternet />
          </View>
        )}
      </View>
      {datasetInfo.activeDatasetName && (
        <View
          style={{
            backgroundColor: Colors.GREEN_LIGHTEST,
            paddingHorizontal: 6,
          }}
        >
          <Text
            style={{ color: Colors.GREEN_DARK, fontWeight: 'bold' }}
          >{`Athena Conversation - ${datasetInfo.activeDatasetName}`}</Text>
          <Text
            style={{ color: Colors.GREEN_MAIN }}
          >{`Updated ${datasetInfo.relativeTime}`}</Text>
        </View>
      )}
      {chatMessagesProcessing || isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={messages}
          ref={messageListRef}
          onLayout={scrollToEnd(false)}
          onContentSizeChange={scrollToEnd()}
          keyExtractor={keyExtractor}
          renderItem={renderItem(onTapMessage, onTapDidYouMean)}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={NoHistory}
        />
      )}
    </View>
  )
}

export default React.memo(ChatMessageContainer)

const styles = StyleSheet.create({
  userMessageWrapper: {
    marginRight: 8,
    marginTop: 6,
    marginBottom: 4,
    padding: 10,
    borderRadius: 16,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderColor: '#d8f6d8',
  },
  athenaMessageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    // justifyContent: 'flex-start',
    // marginVertical: 4,
    // paddingVertical:8,
    marginTop: 4,
    marginRight: 8,
    marginBottom: 4,
    width: screenWidth * 0.83,
  },
  athenaIcon: {
    justifyContent: 'flex-end',
    marginLeft: 2,
    marginRight: 0,
    bottom: -12,
    // width: 52,
    transform: [{ scale: 0.65 }],
  },
  athenaMessageWrapper: {
    // flex: 1,
    // overflow: 'scroll',
    paddingHorizontal: 2,
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
  athenaDidYouMean: {
    borderWidth: 1,
    marginVertical: 4,
    marginHorizontal: 8,
    padding: 5,
    borderRadius: 25,
    paddingHorizontal: 10,
  },
  athenaDidYouMeanContainer: {
    alignItems: 'center',
    marginTop: 8,
    paddingBottom: 4,
  },
  athenaDidYouMeanText: { fontWeight: 'bold' },
  didYouMeanRenderedItems: { marginTop: 10, marginBottom: 10 },
})
