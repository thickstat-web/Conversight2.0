import { ColumnMetadata } from '@/Types/ChatHistory'

/* Athena Message format */
export interface AthenaMessage {
  columnMetadata: ColumnMetadata
  columns: string[]
  createdAt: number
  data: string | any[]
  id: string
  isAthena: boolean
  message: string
  utterance: string
  visualFormats: string[]
}

/* User Message format */
export interface UserMessage {
  message: string
  isAthena: boolean
}

/* Chat Message format */
export type ChatMessage = UserMessage | AthenaMessage
