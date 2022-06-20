import {
  ActionReducerMapBuilder,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { APP_REDUCER } from '@/Constants/redux'
import {
  processChatHistory,
  processChatMessage,
} from '@/Utils/chat-history-processor'
import { RootState } from '..'
import { ChatMessage } from '@/Types/ChatMessage'

interface AppState {
  processingChatMessages: boolean
  processingChatMessage: boolean
  chatMessages: ChatMessage[]
}

const initialState: AppState = {
  processingChatMessages: false,
  processingChatMessage: false,
  chatMessages: [],
}

export const processAndSetChatHistory = createAsyncThunk(
  'app/processChatHistory',
  processChatHistory,
)

const addProcessChatHistory = (builder: ActionReducerMapBuilder<AppState>) => {
  builder
    .addCase(processAndSetChatHistory.pending, state => {
      state.processingChatMessages = true
    })
    .addCase(processAndSetChatHistory.fulfilled, (state, action) => {
      state.processingChatMessages = false
      state.chatMessages = action.payload
    })
}

export const processAndSetChatMessage = createAsyncThunk(
  'app/processChatMessage',
  processChatMessage,
)

const addProcessChatMessage = (builder: ActionReducerMapBuilder<AppState>) => {
  builder
    .addCase(processAndSetChatMessage.pending, state => {
      state.processingChatMessage = true
    })
    .addCase(processAndSetChatMessage.fulfilled, (state, action) => {
      state.processingChatMessage = false
      const { athenaMessage } = action.payload
      state.chatMessages = [...state.chatMessages, athenaMessage]
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
    },
  },
  extraReducers: builder => {
    /* Handles async action */
    addProcessChatHistory(builder)
    addProcessChatMessage(builder)
  },
})

export const selectChatMessages = (state: RootState) =>
  state.appReducer.chatMessages
export const selectProcessingChatMessages = (state: RootState) =>
  state.appReducer.processingChatMessages
export const selectProcessingChatMessage = (state: RootState) =>
  state.appReducer.processingChatMessage

export const { setChatMessages, addChatMessage } = appSlice.actions

export default appSlice.reducer
