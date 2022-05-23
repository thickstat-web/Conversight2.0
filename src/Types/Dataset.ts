export interface DefaultLocaleSettings {
  area?: string
  capacity?: string
  country?: string
  currency?: string
  distance?: string
  mass?: string
  selectedTimeZone?: string
  timeZone?: any[]
  volume?: string
}

export interface Dataset {
  createdTime?: string
  dataSetID: string
  dataSetToken?: string
  datasetName: string
  defaultLocaleSettings?: DefaultLocaleSettings
  description?: string
  domainID?: string
  domainName?: string
  editStatus?: string
  email_domains?: any
  group_setting?: any
  helpQuestions?: any[]
  isNotRepublish?: boolean
  isPrivateDataset?: boolean
  isRestricted?: boolean
  kbNet?: string
  kbnetCompletedTime?: string
  kbnetInitiatedTime?: string
  orgID?: string
  reference_dataset?: string
  republishCompletedTime?: string
  status?: string
  type?: string
  updatedTime?: string
  userID?: string
}

export interface DataSetResponse {
  code?: number
  msg?: string
  data?: Dataset[]
}
