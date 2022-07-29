import { ColType, ColumnMetadata } from './ChatHistory'

export interface Pinboard {
  id: string
  name: string
  ownedById: string
  ownedByName?: string
  shared: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface PinnedItem {
  id: string
  title: string
  renderType: string
  pinboardId: string
  datasetId: string
  createdAt: string
}

export interface PinnedItemRequest {
  pinboardId: string
  dataID: string[]
}

export interface RawPinnedItemData {
  id: string
  columnMetadata: ColumnMetadata
  columns: string[]
  colType: ColType
  createdAt: number
  base64Data: string
  base64QuestionText: string
  pinboardItemId: string
  displayUtterance: string
}

export interface PinnedItemData {
  id: string
  title: string
  renderType: string
  pinboardId: string
  datasetId: string
  createdAt: string
}
