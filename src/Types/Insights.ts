export interface InsightComponent {
  id: string
  followupLoading: boolean
}

export interface InsightData {
  order: number
  answer: string
  updatedAt: Date
  id: string
  dataSetID: string
  category: string[]
  tags: string[]
}

export interface ProActiveInsightComp {
  [key: string]: null | InsightData[]
}

export interface Data {
  proActiveInsightComp: ProActiveInsightComp
}

export interface InsightsResponse {
  code: string
  message: string
  technicalMessage: string
  data: Data
}
