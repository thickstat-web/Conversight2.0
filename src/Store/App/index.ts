import {
  ActionReducerMapBuilder,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { APP_REDUCER } from '@/Constants/redux'
import {
  processChatHistory,
  processConverseData,
} from '@/Utils/chat-history-processor'
import { RootState } from '..'
import { ChatMessage, ConverseData, MessageType } from '@/Types/ChatMessage'

export interface PinboardItem {
  id: string
  loading: boolean
  isTextCard: boolean
}

interface AppState {
  processingChatMessages: boolean
  processingChatMessage: boolean
  converseMap: Record<string, ConverseData[]>
  chatMessages: ChatMessage[]
  chatHistoryLoaded: boolean
  // pinboardItems: PinboardItem[]
}

const initialState: AppState = {
  processingChatMessages: false,
  processingChatMessage: false,
  converseMap: {},
  chatMessages: [],
  chatHistoryLoaded: false,
  // pinboardItems: [],
}

export const processAndSetChatHistory = createAsyncThunk(
  'app/processAndSetChatHistory',
  processChatHistory,
)

const buildConverseMap = (
  chatMessages: ChatMessage[],
): Record<string, ConverseData[]> => {
  return chatMessages
    .filter(item => item.type === MessageType.ATHENA)
    .reduce((acc, item) => {
      acc[item.id] = [item.message as ConverseData]
      return acc
    }, {} as Record<string, ConverseData[]>)
}

const addProcessChatHistory = (builder: ActionReducerMapBuilder<AppState>) => {
  builder
    .addCase(processAndSetChatHistory.pending, state => {
      state.processingChatMessages = true
    })
    .addCase(processAndSetChatHistory.fulfilled, (state, action) => {
      state.processingChatMessages = false
      state.converseMap = {
        ...state.converseMap,
        ...buildConverseMap(action.payload),
      }
      state.chatMessages = action.payload
      state.chatHistoryLoaded = true
    })
}

export const processAndAddChatMessage = createAsyncThunk(
  'app/processAndAddChatMessage',
  processConverseData,
)

const addProcessChatMessage = (builder: ActionReducerMapBuilder<AppState>) => {
  builder
    .addCase(processAndAddChatMessage.pending, state => {
      state.processingChatMessage = true
    })
    .addCase(processAndAddChatMessage.fulfilled, (state, { payload }) => {
      state.processingChatMessage = false
      const { athenaMessage, converseData } = payload
      state.chatMessages.push(athenaMessage)

      const { id } = converseData
      state.converseMap[id] = [converseData]
    })
}

const appSlice = createSlice({
  name: APP_REDUCER,
  initialState,
  reducers: {
    setChatMessages: (state, { payload }: PayloadAction<ChatMessage[]>) => {
      state.chatMessages = payload
    },
    addChatMessage: (state, { payload }: PayloadAction<ChatMessage>) => {
      // Add user sending message to the list
      state.chatMessages.push(payload)

      const { id, type, message } = payload
      if (type === MessageType.ATHENA) {
        state.converseMap[id] = [message as ConverseData]
      }
    },
    cleanupAppData: state => {
      Object.assign(state, initialState)
    },
    // setPinboardItemLoading: (state, { payload }: PayloadAction<string>) => {
    //   const item: PinboardItem = {
    //     id: payload,
    //     loading: true,
    //     isTextCard: false,
    //   }
    //   state.pinboardItems.push(item)
    // },
    addConverseData: (state, { payload }: PayloadAction<ConverseData>) => {
      const { id } = payload
      state.converseMap[id] = [payload]

      // const index = state.pinboardItems.findIndex(item => item.id === id)
      // const item = state.pinboardItems[index]
      // state.pinboardItems[index] = {
      //   ...item,
      //   loading: false,
      //   isTextCard: !!payload.visualFormats.find(_ => _.type === 'Text'),
      // }
    },
  },
  extraReducers: builder => {
    /* Handles async action */
    addProcessChatHistory(builder)
    addProcessChatMessage(builder)
  },
})

export const selectChatHistoryLoaded = (state: RootState) =>
  state.appReducer.chatHistoryLoaded
export const selectChatMessages = (state: RootState) =>
  state.appReducer.chatMessages
export const selectProcessingChatMessages = (state: RootState) =>
  state.appReducer.processingChatMessages
export const selectProcessingChatMessage = (state: RootState) =>
  state.appReducer.processingChatMessage
export const selectConverseData = (state: RootState) =>
  state.appReducer.converseMap
// export const selectPinboardItems = (state: RootState) =>
//   state.appReducer.pinboardItems

export const {
  setChatMessages,
  addChatMessage,
  cleanupAppData,
  addConverseData,
  // setPinboardItemLoading,
} = appSlice.actions

export default appSlice.reducer
