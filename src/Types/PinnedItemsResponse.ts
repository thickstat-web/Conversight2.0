/* Response of Get PinnedItems of a Single Pinboard */
export interface Position {
  h: string
  w: string
  x: string
  y: string
}

export interface PositionV2 {
  h: number
  w: number
  x: number
  y: number
}

export interface Color { }

export interface PinBoardComponent {
  sql: boolean
  data: boolean
  isSingleValue: boolean
  referenceID: string
  chartType: string
  tableAdditionalData: string
  _key: string
  dataSetID: string
  domain: string
  pinBoardID: string
  size: string
  ganttOptions: string
  calenderOptions: string
  displayUtterance: string
  position: Position
  positionV2: PositionV2
  color: Color
  title: string
  utterance: string
  sqlQuery: string
  connectorID: string
  role: string[]
  group: string[]
  pivotAdditionalData: string
  colMetaData?: any
  chartRenderOptions?: any
  chartRenderOptionsV2?: any
  createdAt: string
  retainFilters: any[]
}

export interface Data {
  pinBoardComponents: PinBoardComponent[]
}

export interface ListPinnedItemsResponse {
  code: string
  message: string
  technicalMessage: string
  data: Data
}
