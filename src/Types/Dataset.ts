export interface DataSetResponse {
  code?: number
  msg?: string
  data?: Dataset[]
}


export interface DatasetResponse {
  code: number
  msg: string
  data: Dataset[]
}

export interface Dataset {
  access: boolean
  _key: string
  dataset_name: string
  dataset_type: string
  description: string
  status: string
  refresh_status: string
  errmsg: string
  athena_mode: string
  mode: string
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
  isRestricted: boolean
  email_domains: any
  group_setting: any
  role_setting?: RoleSetting[]
  origin: string
  org_id: string
  last_job_id: string
  load_completed_at: string
  initial_load: boolean
  save_exit: boolean
  kbNet: string
  synapsnet_replica: number
  synapsnet_schema?: SynapsnetSchema
  conversation_api: ConversationApi
  data_execution: string
  defaultLocaleSettings: DefaultLocaleSettings
  storage_type: string
  fork_category: string
  flow_status: string
  externalConnector: boolean
  disable_info: DisableInfo
  athena_threads: boolean
}

export interface RoleSetting {
  role_id: string
  settings: any
}

export interface SynapsnetSchema {
  active: boolean
  backup: string
  cleanup: string
  current: string
}

export interface ConversationApi {
  enableThread: boolean
  enableGPT: boolean
  enabled: boolean
  freeForm: boolean
  version: string
  api: string
  skillID: string
  defaultGPTModel: string
  gptModels?: GptModel[]
  configuration: Configuration2
}

export interface GptModel {
  configuration: Configuration
  context: string
  label: string
  memory: string
  skillID: string
  updated_at: string
  value: string
  visibility: boolean
}

export interface Configuration {
  clarification: Clarification
  disclaimer: Disclaimer
  entityClarification: EntityClarification
  entityContext: EntityContext
  semanticVerify: boolean
  destinationConnector?: DestinationConnector
  gptVerify?: GptVerify
}

export interface Clarification {
  message: string
  threshold: number
}

export interface Disclaimer {
  message: string
  threshold: number
}

export interface EntityClarification {
  count: number
  defaultEntities: any[]
  threshold: Threshold
}

export interface Threshold {
  averageMatch: number
  exactMatch: number
  leastMatch: number
  topMatch: number
}

export interface EntityContext {
  sparseVector: boolean
}

export interface DestinationConnector {
  connectorID: string
}

export interface GptVerify {
  enabled: boolean
  skillID: string
}

export interface Configuration2 {
  entityThreshold: number
}

export interface DefaultLocaleSettings {
  area: string
  capacity: string
  country: string
  currency: string
  date_format: string
  distance: string
  mass: string
  volume: string
  time_zone: string
  isISODateFormat: boolean
}

export interface DisableInfo {
  settings: any
  steps_configuration: StepsConfiguration
}

export interface StepsConfiguration {
  load: any
}