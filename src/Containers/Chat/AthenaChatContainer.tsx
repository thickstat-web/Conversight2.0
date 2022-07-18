import React, {
  createRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { View } from 'react-native-ui-lib'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector, useTheme } from '@/Hooks'
import { selectDatasetId } from '@/Store/Auth'
import { processAndSetChatHistory } from '@/Store/App'
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
  const [getChatHistory, { isLoading }] = useGetChatHistoryMutation()

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

  const handleDatasetSelection = (datasetId: string) => {
    console.log(`[ChatContainer] dataset: ${datasetId}`)
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
