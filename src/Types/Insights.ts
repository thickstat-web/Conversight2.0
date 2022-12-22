import { FollowupType } from './Common'

export interface InsightComponent {
  id: string
  type: FollowupType
  followupLoading: boolean
  voiceLoading: boolean
  voice: string
}

export interface InsightVoice {
  id: string
  voice: string
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
