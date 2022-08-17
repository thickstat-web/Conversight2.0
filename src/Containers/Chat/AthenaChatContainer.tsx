import React, { useCallback, useEffect, useRef } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { View } from 'react-native-ui-lib'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector, useTheme } from '@/Hooks'
import { selectDatasetId } from '@/Store/Auth'
import { processAndSetChatHistory, selectChatHistoryLoaded } from '@/Store/App'
import { useGetChatHistoryMutation } from '@/Services/modules/bot'
import { ChatHistoryRequestData } from '@/Types/ChatHistory'
import ChatMessageContainer from './ChatMessageContainer'
import ChatBox, { RefProps } from './ChatBox'

const AthenaChatContainer = () => {
  const { t } = useTranslation()
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

  return (
    <SafeAreaView style={[Layout.fill, { backgroundColor: Colors.GREEN_MAIN }]}>
      <View flex style={{ backgroundColor: Colors.GRAY }}>
        <ChatMessageContainer
          isLoading={isLoading}
          onTapMessage={setChatText}
        />
        <ChatBox onDatasetChange={handleDatasetSelection} ref={chatboxRef} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  searchContainer: {
    position: 'absolute',
    width: '100%',
  },
})

export default AthenaChatContainer
