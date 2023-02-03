import { ColType } from './ChatHistory'
import { ColumnMetadata } from '@/Types/ChatHistory'

/* Raw Convese Message format */
export interface RawConverseData {
  id: string
  colType: ColType
  columnMetadata: ColumnMetadata
  columns: string[]
  base64Data: string
  orderedColumns: string[]
  text: string
  utterance: string
  status: string
  createdAt: number
}

export type ChartType =
  | 'AreaChart'
  | 'BarChart'
  | 'HorizontalBarChart'
  | 'DonutChart'
  // | 'DualAxes'
  // | 'FunnelChart'
  | 'LineChart'
  | 'PieChart'

export type VisualType = 'Text' | 'Table' | ChartType

/* Visual format */
export interface VisualFormat {
  type: string | VisualType
  xField: string
  yField: string | string[]
  colorField?: string
  angleField?: string
  isStack?: boolean
  isGroup?: boolean
}

export enum MessageType {
  USER,
  ATHENA,
  ATHENA_ERROR,
}

export interface TextData {
  prefix: string
  value: string
  roundedValue: string
  abbrValue: string
  suffix: string
}

/* Converse Data format */
export interface ConverseData {
  columnMetadata: ColumnMetadata
  columns: string[]
  createdAt: number
  id: string
  isError: boolean
  message: string
  utterance: string
  textData: TextData
  values: Array<Record<string, any>>
  visualFormats: VisualFormat[]
}

export interface Clarification {
  title: string
  suggestions: string[]
}

export enum AthenaResponseType {
  CONVERSE,
  CLARIFICATION,
  ATHENA_ERROR,
}

export interface AthenaResponse {
  type: AthenaResponseType
  error?: string
  data?: Clarification | RawConverseData
}

// /* Athena Failure Message format */
// export interface AthenaFailureMessage extends BaseMessage {
//   isFailed: boolean
// }

// /* User Message format */
// export interface UserMessage extends BaseMessage { }

// /* Athena Message format */
// export interface AthenaMessage {
//   converseId: string
//   data: ConverseData
// }

/* Processed Chat Message format */
// export type ChatMessage = UserMessage | AthenaMessage | AthenaFailureMessage

/* Base Message format */
// export interface BaseMessage {
//   id: string
//   type: MessageType
// }

/* Chat Message format */
export interface ChatMessage {
  id: string
  type: MessageType
  message: string | ConverseData
}
