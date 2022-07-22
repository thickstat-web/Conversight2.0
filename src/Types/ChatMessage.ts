import { ColType } from './ChatHistory'
import { ColumnMetadata } from '@/Types/ChatHistory'

/* Raw Chat Message format */
export interface RawChatMessage {
  columnMetadata: ColumnMetadata
  columns: string[]
  colType: ColType
  createdAt: number
  base64Data: string
  id: string
  displayUtterance: string
  text: string
  utterance: string
  status: string
}

export type ChartType =
  | 'AreaChart'
  | 'BarChart'
  | 'ColumnChart'
  | 'DonutChart'
  // | 'DualAxes'
  // | 'FunnelChart'
  | 'LineChart'
  | 'PieChart'

export type VisualFormatType = 'Text' | 'Table' | ChartType | 'Error'

/* Visual format */
export interface VisualFormat {
  type: VisualFormatType
  xField: string
  yField: string | string[]
  colorField?: string
  angleField?: string
  isStack?: boolean
  isGroup?: boolean
}

/* Athena Message format */
export interface AthenaMessage {
  columnMetadata: ColumnMetadata
  columns: string[]
  createdAt: number
  id: string
  isAthena: boolean
  message: string
  utterance: string
  value: string
  values: Array<Record<string, any>>
  visualFormats: VisualFormat[]
}

/* Base Message format */
export interface BaseMessage {
  id: string
  message: string
  isAthena: boolean
}

/* Athena Failure Message format */
export interface AthenaFailureMessage extends BaseMessage {
  data: Array<Record<string, string>>
  visualFormats: VisualFormat[]
}

/* User Message format */
export interface UserMessage extends BaseMessage { }

/* Processed Chat Message format */
export type ChatMessage = UserMessage | AthenaMessage | AthenaFailureMessage
