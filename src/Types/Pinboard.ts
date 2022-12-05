import { ColType, ColumnMetadata } from './ChatHistory'

export type FilterCategory =
  | 'dateFilter'
  | 'dimensions'
  | 'calculated dimension'

export interface FilterValue {
  id: string | number
  name: string | number
}

export interface DateValue {
  dateValueFrom: string
  dateValueTo: string
}

export interface Filter {
  category: string | FilterCategory
  column: string
  resolvedColumn: string
  dateFrom?: string
  dateTo?: string
  datasetId: string
  operator: string
  value: string | FilterValue[]
  dateValues: DateValue[]
  isDefault: boolean
}

export interface Pinboard {
  id: string
  name: string
  ownedById: string
  ownedByName?: string
  shared: boolean
  tags: string[]
  appliedFilters: Filter[]
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
  dataId: string | string[]
}

export interface RawPinnedItemData {
  id: string
  columnMetadata: ColumnMetadata
  columns: string[]
  colType: ColType
  createdAt: number
  base64Data: string
  utterance: string
  text: string
  status: string
}

export interface RawConverseData {
  id: string
  columnMetadata: ColumnMetadata
  columns: string[]
  colType: ColType
  createdAt: number
  base64Data: string
  status: string
  text: string
  utterance: string
}

export interface PinnedItemData {
  id: string
  title: string
  renderType: string
  pinboardId: string
  datasetId: string
  createdAt: string
}
