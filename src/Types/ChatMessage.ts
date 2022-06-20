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

/* Visual format */
export interface VisualFormat {
  type: string
  xAxisField: string
  yAxisField: string | string[]
  isStack?: boolean
  isGroup?: boolean
}

/* Athena Message format */
export interface AthenaMessage {
  columnMetadata: ColumnMetadata
  columns: string[]
  createdAt: number
  data: Array<Record<string, any>>
  id: string
  isAthena: boolean
  message: string
  utterance: string
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
