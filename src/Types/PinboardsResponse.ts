/* Get All Pinboards Response */
export interface SharedTo {
  userID: string
  isEdit: boolean
}

export interface SharedToRole {
  roleID: string
  dataSetID: string
  isAllUser: boolean
}

export interface RetainFilter {
  isSingleValue: boolean
  isDisable: boolean
  isDefault: boolean
  data_set: string
  id: string
  processedID: string
  processedRequestID: string
  category: string
  dateValueFrom: string
  dateValueTo: string
  value: any
  dateValues?: any
  vocabulary: string[]
  operator: string
}

export interface SortableUI {
  chart?: any
  card?: any
}

export interface Created {
  createdAt: Date
  ownerID: string
  _key: string
  pinBoardID: string
  pinName: string
  updatedAt: Date
  sharedTo: SharedTo[]
  sharedToRole: SharedToRole[]
  retainFilters: RetainFilter[]
  mergedPinData?: any
  sortableUI: SortableUI
  tags: any[]
}

export interface SortableUI2 {
  chart?: any
  card?: any
}

export interface RetainFilter2 {
  isSingleValue: boolean
  isDisable: boolean
  isDefault: boolean
  data_set: string
  id: string
  processedID: string
  processedRequestID: string
  category: string
  dateValueFrom: string
  dateValueTo: string
  value: any[]
  dateValues?: any
  vocabulary?: any
  operator: string
}

export interface Shared {
  createdAt: Date
  ownerID: string
  ownerName: string
  _key: string
  pinBoardID: string
  pinName: string
  updatedAt: Date
  sortableUI: SortableUI2
  retainFilters: RetainFilter2[]
  mergedPinData?: any
  tags?: any
  IsEdit: boolean
  sharedTo?: any
  sharedToRole?: any
}

export interface GetPinboardData {
  created: Created[]
  shared: Shared[]
}

export interface Data {
  GetPinboardData: GetPinboardData
}

export interface ListPinboardsResponse {
  code: string
  message: string
  technicalMessage: string
  data: Data
}
