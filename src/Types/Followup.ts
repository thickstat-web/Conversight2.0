import { ColType, ColumnMetadata } from '@/Types/ChatHistory'
import { RawConverseData } from './ChatMessage'
import { FollowupType, URLFollowupData } from './Common'

export interface Followup {
  dataSetID: string
  proActiveCompIDs: string[]
}

export interface FollowupRequest {
  followup: Followup[]
}

export interface Error4 {
  errorArgs: string
  errorIn: string
  message: string
  technicalMessage: string
}

export interface Sheet3Revenue5 {
  displayTemplate: string
  template: string
}

export interface Followup4 {
  [key: string]: Sheet3Revenue5
}

export interface DrillDown4 {
  followup: Followup4
}

export interface FollowupComponentData {
  status: string
  data: string
  chart: boolean
  show: string
  text: string
  val: string
  questiontext: string
  utterance: string
  createdAt: number
  dataset: string
  colType: ColType
  columns: string[]
  semantics: string
  column_metadata: ColumnMetadata
  error: Error4
  drill_down: DrillDown4
  ID: string
  isCursor: boolean
  totalRecords: number
  sqlForm: string
  retain_filter?: any
  code: string
  annotateFlag: boolean
  isColumnReorder: boolean
  questionType: string
  responseType: string
  processedUtterance: string
  resolvedQuery: string
  additional_data: string
  displayUtterance: string
  executedQuery: string
  cachedData: boolean
}

export interface URLFollowupComponentData {
  explorerURL: string
  thumbnailURL: string
  type: string
}

export interface ProActiveInsightCompFollowup {
  [key: string]: Record<
    string,
    FollowupComponentData & URLFollowupComponentData
  >
}

export interface Data {
  proActiveInsightCompFollowup: ProActiveInsightCompFollowup
}

export interface FollowupResponse {
  code: string
  message: string
  technicalMessage: string
  data: Data
}

export interface RawFollowupData {
  type: FollowupType
  data: URLFollowupData | RawConverseData
}
