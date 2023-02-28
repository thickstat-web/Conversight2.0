export interface Message {
  text: string
  dataSet: string
  objectID: any[]
  filter: any[]
  qtype: string
}

export interface Options {
  transform: boolean
  channel: string
  source: string
  timezone: string
}

export interface Session {
  message: Message
  options: Options
}

export interface SendChatMessage {
  session: Session
}

// ---- Send Chat Response - Start ----
export interface AdditionalData2 {}

export interface I102 {
  additional_data: AdditionalData2
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData3 {}

export interface By {
  additional_data: AdditionalData3
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData4 {
  aggregation: string
  is_update: boolean
  precision: number
}

export interface Spend {
  additional_data: AdditionalData4
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  is_editable: boolean
  mode: string
  source_datatype: string
  synonym: string
  table: string
  target_type: string
  type: string
  unit: string
}

export interface AdditionalData5 {}

export interface Top {
  additional_data: AdditionalData5
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData6 {
  is_update: boolean
  precision: number
}

export interface Vendors {
  additional_data: AdditionalData6
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  is_editable: boolean
  mode: string
  source_datatype: string
  synonym: string
  table: string
  target_type: string
  type: string
  unit: string
}

export interface TagMetadata {
  10: I102
  by: By
  spend: Spend
  top: Top
  vendors: Vendors
}

export interface ReRequest {
  title: string
  question: string
}

export type SubType = 'clarify' | 're-request'

export interface AdditionalData {
  followup_questions: string[]
  reRequest: ReRequest
  question_tag: string
  sub_type: SubType
  tag_metadata: TagMetadata
  tags: any[][]
}

export interface ColType {
  date: string[]
  dim: string[]
  metrics: string[]
}

export interface AdditionalData7 {
  aggregation: string
  is_update: boolean
  precision: number
}

export interface POITEMTotalcost {
  additional_data: AdditionalData7
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface Entities {}

export interface AdditionalData8 {
  is_update: boolean
  precision: number
}

export interface PoRemittoname {
  additional_data: AdditionalData8
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type?: any
  unit?: any
}

export interface ColumnMetadata {
  PO_ITEM_totalcost: POITEMTotalcost
  entities: Entities
  po_remittoname: PoRemittoname
}

export interface DrillDown {}

export interface TimeTaken {
  checkCache: number
  dataProcessing: number
  nlu: number
  postProcessor: number
  preProcessing: number
  response: number
  totalProcess: number
}

export interface Clarify {
  info: string
  tags: any
  text: string
}

export interface Data {
  additional_data: AdditionalData
  backendSqlForm: string
  cacheKey: string
  cachedData: boolean
  chart: boolean
  clarify: Clarify[]
  code: string
  colType: ColType
  column_metadata: ColumnMetadata
  columns: string[]
  createdAt: number
  ctx: string
  dataType: string
  dataset: string
  drill_down: DrillDown
  error?: any
  executedQuery: string
  followup_questions: string[]
  id: string
  isColumnReorder: boolean
  isCursor: boolean
  parent_question: string
  processedUtterance: string
  questionType: string
  resolvedQuery: string
  responseType: string
  retain_filter: any[]
  selectColumns: string[]
  semantics: string
  show: string
  sqlForm: string
  status: string
  text: string
  timeTaken: TimeTaken
  utterance: string
  val: string
}

export interface Response {
  text?: string
  data: Data
  additional_data?: AdditionalData
}

export interface SendChatMessageResponse {
  response: Response
  status: string
}
// ---- Send Chat Response - End ----
