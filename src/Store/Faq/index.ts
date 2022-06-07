import { createSlice } from '@reduxjs/toolkit'
import { FAQ_REDUCER } from '@/Constants/redux'
import { RootState } from '..'

interface Faqs {
  questions: string[]
  modalSearchOpen: boolean
  keyword: string
}

const initialState: Faqs = {
  questions: [],
  modalSearchOpen: false,
  keyword: '',
}

const faqSlice = createSlice({
  name: FAQ_REDUCER,
  initialState: initialState,
  reducers: {
    setQuestions: (state, { payload }) => {
      console.log(payload)
      state.questions = [...payload]
    },
    setModalSearchOpen: (state, { payload }) => {
      state.modalSearchOpen = payload
    },
    setKeyWord: (state, { payload }) => {
      state.keyword = payload
    },
  },
})

export const selectFAQ = (state: RootState) => state.faqReducer.questions

export const selectModalSearchOpen = (state: RootState) =>
  state.faqReducer.modalSearchOpen

export const selectKeyword = (state: RootState) => state.faqReducer.keyword

export const { setQuestions, setModalSearchOpen, setKeyWord } = faqSlice.actions

export default faqSlice.reducer
