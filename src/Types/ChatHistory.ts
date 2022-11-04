/* Chat History request data format */
export interface Page {
  from: number
  size: number
}

export interface ChatHistoryRequestData {
  dataSet: string
  page: Page
}

/* Chat History response data format */
export interface ColType {
  date: string[]
  dim: string[]
  metrics: string[]
}

export interface AdditionalData {
  is_update: boolean
}

export interface SODatecompleted {
  additional_data: AdditionalData
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData2 {
  dir: string
  is_update: boolean
}

export interface SOPriorityid {
  additional_data: AdditionalData2
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData3 {
  dir: string
  is_update: boolean
}

export interface SOSoNum {
  additional_data: AdditionalData3
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData4 {
  dir: string
  is_update: boolean
}

export interface SOITEMDatelastfulfillment {
  additional_data: AdditionalData4
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData5 {
  dir: string
  is_update: boolean
}

export interface SOITEMDatescheduledfulfillment {
  additional_data: AdditionalData5
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData6 {
  default_size: number
  dir: string
  is_update: boolean
  max_length: number
  precision: number
}

export interface SOITEMItemMargin {
  additional_data: AdditionalData6
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData7 {
  dir: string
  is_update: boolean
}

export interface SOITEMProductnum {
  additional_data: AdditionalData7
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData8 {
  default_size: number
  dir: string
  is_update: boolean
  max_length: number
  precision: number
}

export interface SOITEMQtyfulfilled {
  additional_data: AdditionalData8
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData9 {
  default_size: number
  dir: string
  is_update: boolean
  max_length: number
  precision: number
}

export interface SOITEMQtyordered {
  additional_data: AdditionalData9
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData10 {
  default_size: number
  dir: string
  is_update: boolean
  max_length: number
  precision: number
}

export interface SOITEMQtytofulfill {
  additional_data: AdditionalData10
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData11 {
  dir: string
  is_update: boolean
  max_length: number
}

export interface SOITEMSoitemStatus {
  additional_data: AdditionalData11
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData12 {
  dir: string
  is_update: boolean
  max_length: number
}

export interface SOITEMSoitemType {
  additional_data: AdditionalData12
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData13 {
  default_size: number
  dir: string
  is_update: boolean
  max_length: number
  precision: number
}

export interface SOITEMTotalcost {
  additional_data: AdditionalData13
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData14 {
  default_size: number
  dir: string
  is_update: boolean
  max_length: number
  precision: number
}

export interface SOITEMTotalprice {
  additional_data: AdditionalData14
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface Color {
  backgroundColor: string
  textColor: string
}

export interface AdditionalData15 {
  aggregation: string
  color: Color
  default_size: number
  dir: string
  is_update: boolean
  max_length: number
  precision: number
}

export interface SOITEMUnitprice {
  additional_data: AdditionalData15
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData16 { }

export interface DurationInDays {
  additional_data: AdditionalData16
  alias: string
  category: string
  column_name: string
  data_type: string
  hideFrom: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface Sam980prom21024 {
  alias: string
  resolved: string[]
}

export interface Entities {
  sam980prom21024: Sam980prom21024
}

export interface AdditionalData17 {
  dir: string
  is_update: boolean
  max_length: number
}

export interface ProductDescription {
  additional_data: AdditionalData17
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface SOPriorityid2 {
  dir: string
}

export interface SOSoNum2 {
  dir: string
}

export interface SOITEMDatelastfulfillment2 {
  dir: string
}

export interface SOITEMDatescheduledfulfillment2 {
  dir: string
}

export interface SOITEMItemMargin2 {
  dir: string
}

export interface SOITEMProductnum2 {
  dir: string
}

export interface SOITEMQtyfulfilled2 {
  dir: string
}

export interface SOITEMQtyordered2 {
  dir: string
}

export interface SOITEMQtytofulfill2 {
  dir: string
}

export interface SOITEMSoitemStatus2 {
  dir: string
}

export interface SOITEMSoitemType2 {
  dir: string
}

export interface SOITEMTotalcost2 {
  dir: string
}

export interface SOITEMTotalprice2 {
  dir: string
}

export interface SOITEMUnitprice2 {
  dir: string
}

export interface ProductDescription2 {
  dir: string
}

export interface AdditionalData18 {
  _str: string
  columns: string[]
  is_update: boolean
  limit: number
  select: string[]
  sort: any
  type: string
}

export interface SalesOrderDetails {
  additional_data: AdditionalData18
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
  is_editable?: boolean
  mode: string
  source_datatype: string
  target_type: string
}

export interface AdditionalData19 {
  _str: string
  aggregation: string
  columns: string[]
  formula: string
  isRowLevel: boolean
  is_update: boolean
  precision: number
  type: string
  unprocessed_formula: string
}

export interface OpMetricsSOITEMQtyfulfilledMetricsSOITEMUnitpriceOzShippedRevenue {
  additional_data: AdditionalData19
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData20 {
  _str: string
  aggregation: string
  columns: string[]
  formula: string
  isRowLevel: boolean
  is_update: boolean
  precision: number
  type: string
  unprocessed_formula: string
}

export interface ShippedRevenue {
  additional_data: AdditionalData20
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData21 {
  _str: string
  aggregation: string
  columns: string[]
  formula: string
  isRowLevel: boolean
  is_update: boolean
  precision: number
  type: string
  unprocessed_formula: string
}

export interface SubqueryLabelShippedRevenue {
  additional_data: AdditionalData21
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData22 {
  is_update: boolean
}

export interface SOITEMDatefulfillment {
  additional_data: AdditionalData22
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface YearMonth {
  alias: string
  column_name: string
}

export interface AdditionalData23 {
  is_update: boolean
}

export interface POITEMDatescheduledfulfillment {
  additional_data: AdditionalData23
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface AdditionalData24 {
  default_size: number
  is_update: boolean
  max_length: number
  precision: number
}

export interface POITEMTotalcost {
  additional_data: AdditionalData24
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type: string
  unit: string
}

export interface POITEMBilledCost {
  dir: string
}

export interface POITEMDatelastfulfillment {
  dir: string
}

export interface POITEMDatescheduledfulfillment2 {
  dir: string
}

export interface POITEMPoitemStatus {
  dir: string
}

export interface POITEMQtyfulfilled {
  dir: string
}

export interface POITEMQtytofulfill {
  dir: string
}

export interface POITEMTotalcost2 {
  dir: string
}

export interface POITEMUnitcost {
  dir: string
}

export interface PartDescription {
  dir: string
}

export interface PartNum {
  dir: string
}

export interface PoDatecreated {
  dir: string
}

export interface PoDateissued {
  dir: string
}

export interface PoNum {
  dir: string
}

export interface VendorName {
  dir: string
}

export interface AdditionalData25 {
  _str: string
  columns: string[]
  is_update: boolean
  limit: number
  select: string[]
  sort: any
  type: string
}

export interface PurchaseOrderDetails {
  additional_data: AdditionalData25
  alias: string
  category: string
  data_type: string
  id: string
  is_editable: boolean
  mode: string
  source_datatype: string
  synonym: string
  table: string
  target_type: string
  type: string
  unit: string
}

export interface AdditionalData26 {
  is_update: boolean
}

export interface PoNum2 {
  additional_data: AdditionalData26
  alias: string
  category: string
  data_type: string
  id: string
  is_editable: boolean
  mode: string
  source_datatype: string
  synonym: string
  table: string
  target_type: string
  type: string
  unit: string
}

export interface AdditionalData27 {
  is_update: boolean
  max_length: number
}

export interface VendorName2 {
  additional_data: AdditionalData27
  alias: string
  category: string
  column_name: string
  data_type: string
  id: string
  synonym: string
  table: string
  type?: any
  unit?: any
}

export interface ColumnMetadata {
  isNumericFormat?: boolean
  [key: string]: any
}

export interface SOPriorityid3 {
  displayTemplate: string
  template: string
}

export interface SOSoNum3 {
  displayTemplate: string
  template: string
}

export interface SOITEMDatescheduledfulfillment3 {
  displayTemplate: string
  template: string
}

export interface SOITEMItemMargin3 {
  displayTemplate: string
  template: string
}

export interface SOITEMProductnum3 {
  displayTemplate: string
  template: string
}

export interface SOITEMQtyfulfilled3 {
  displayTemplate: string
  template: string
}

export interface SOITEMQtyordered3 {
  displayTemplate: string
  template: string
}

export interface SOITEMQtytofulfill3 {
  displayTemplate: string
  template: string
}

export interface SOITEMSoitemStatus3 {
  displayTemplate: string
  template: string
}

export interface SOITEMSoitemType3 {
  displayTemplate: string
  template: string
}

export interface SOITEMTotalcost3 {
  displayTemplate: string
  template: string
}

export interface SOITEMTotalprice3 {
  displayTemplate: string
  template: string
}

export interface SOITEMUnitprice3 {
  displayTemplate: string
  template: string
}

export interface ProductDescription3 {
  displayTemplate: string
  template: string
}

export interface ShippedRevenue2 {
  displayTemplate: string
  template: string
}

export interface YearMonth2 {
  displayTemplate: string
  template: string
}

export interface POITEMTotalcost3 {
  displayTemplate: string
  template: string
}

export interface VendorName3 {
  displayTemplate: string
  template: string
}

export interface DrillDown {
  followup: any
}

export interface Message {
  status: string
  data: string
  chart: boolean
  show: string
  text: string
  val: string
  questiontext: string
  utterance: string
  createdAt: number
  dataset: string
  colType: ColType
  columns: string[]
  domain: string
  semantics: string
  column_metadata: ColumnMetadata
  error?: any
  drill_down: DrillDown
  ID: string
  isCursor: boolean
  totalRecords: number
  sqlForm: string
  retain_filter: any[]
  code: string
  annotateFlag: boolean
  isColumnReorder: boolean
  questionType: string
  responseType: string
  processedUtterance: string
  resolvedQuery: string
  additional_data: string
  displayUtterance: string
  executedQuery: string
  cachedData: boolean
  parent_question: string
}

export interface ChatHistoryResponse {
  data: Message[]
  status: boolean
  mesg: string
}
