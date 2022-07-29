/* PinnedItemData - Response */
export interface Error {
  eventID: string
  message: string
  timestamp: Date
}

export interface Data2 {
  status: string
  data: string
  chart: boolean
  show: string
  val: string
  questiontext: string
  utterance: string
  createdAt: number
  dataset: string
  colTypeString: string
  columns: string[]
  domain: string
  semantics: string
  colMetadata: string
  error: Error
  drillDown: string
  ID: string
  id: string
  pinboardId: string
  isCursor: boolean
  totalRecords: number
  sqlForm: string
  retain_filter: any[]
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

export interface PinBoardComponentData {
  data: Data2
  refreshStatus: string
}

export interface Data {
  pinBoardComponentData: PinBoardComponentData[]
}

export interface PinnedItemDataResponse {
  code: string
  message: string
  technicalMessage: string
  data: Data
}
