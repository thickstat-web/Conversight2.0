import { createSlice } from '@reduxjs/toolkit'
import { FAQ_REDUCER } from '@/Constants/redux'
import { RootState } from '..'

interface Faqs {
  questions: string[]
}

const initialState: Faqs = {
  questions: [],
}

const faqSlice = createSlice({
  name: FAQ_REDUCER,
  initialState: initialState,
  reducers: {
    setQuestions: (state, { payload }) => {
        console.log(payload)
      state.questions = [...payload]
    },
  },
})

export const selectFAQ = (state: RootState) => state.faqReducer.questions

export const { setQuestions } = faqSlice.actions

export default faqSlice.reducer
