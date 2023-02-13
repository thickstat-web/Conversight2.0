import ChatBox, { RefProps } from './ChatBox'
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useRef } from 'react'
import { processAndSetChatHistory, selectChatHistoryLoaded } from '@/Store/App'
import { useAppDispatch, useAppSelector, useTheme } from '@/Hooks'

import { ChatHistoryRequestData } from '@/Types/ChatHistory'
import ChatMessageContainer from './ChatMessageContainer'
import { View } from 'react-native-ui-lib'
import { selectDatasetId } from '@/Store/Auth'
import { useGetChatHistoryMutation } from '@/Services/modules/bot'
import { useHeaderHeight } from '@react-navigation/elements'
import { useTranslation } from 'react-i18next'

const AthenaChatContainer = () => {
  const { t } = useTranslation()
  const headerHeight = useHeaderHeight()

  const chatboxRef = useRef<RefProps>()
  const dispatch = useAppDispatch()
  const { Layout, Colors, Common, Fonts } = useTheme()

  const selectedDatasetId = useAppSelector(selectDatasetId)
  const chatHistoryLoaded = useAppSelector(selectChatHistoryLoaded)
  const [getChatHistory, { isLoading }] = useGetChatHistoryMutation()

  const loadChatHistory = useCallback(
    (datasetId: string) => {
      const reqData: ChatHistoryRequestData = {
        dataSet: datasetId,
        page: {
          from: 0,
          size: 5,
        },
      }
      const fetchChatHistory = async () => {
        const resp = await getChatHistory(reqData).unwrap()
        dispatch(processAndSetChatHistory(resp.data || []))
      }

      fetchChatHistory()
    },
    [dispatch, getChatHistory],
  )

  useEffect(() => {
    if (!chatHistoryLoaded && selectedDatasetId) {
      loadChatHistory(selectedDatasetId)
    }
  }, [chatHistoryLoaded, selectedDatasetId, loadChatHistory])

  // useEffect(() => {
  //   loadChatHistory()
  // }, [chatHistoryLoaded, loadChatHistory])

  const handleDatasetSelection = (datasetId: string) => {
    console.log(`[ChatContainer] dataset: ${datasetId}`)
    loadChatHistory(datasetId)
  }

  const setChatText = (text: string) => {
    chatboxRef?.current?.setUtterance(text)
  }

  const sendChatMessage = (text: string) => {
    chatboxRef?.current?.sendMessage(text)
  }

  return (
    <View flex style={{ backgroundColor: Colors.GRAY }}>
      <ChatMessageContainer
        isLoading={isLoading}
        onTapMessage={setChatText}
        onTapDidYouMean={sendChatMessage}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
      >
        <ChatBox onDatasetChange={handleDatasetSelection} ref={chatboxRef} />
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  searchContainer: {
    position: 'absolute',
    width: '100%',
  },
})

export default AthenaChatContainer
