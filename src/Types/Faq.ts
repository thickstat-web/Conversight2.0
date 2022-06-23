export interface FaqRequestData {
  dataset: string[]
  isQuestionsOnly: boolean
}

export interface FaqResponseData {
  status: string
  data: string[]
}

export interface HelpQuestion {
  question: string
  tags: string[]
}

export interface HelpQuestionResponse {
  msg: string
  question_list: HelpQuestion[]
}
