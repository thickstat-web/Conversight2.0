import { Engine } from 'json-rules-engine'
import { atob } from 'react-native-quick-base64'
import chartRules from '@/Config/chart-rules.json'
import { ColType, ColumnMetadata } from '@/Types/ChatHistory'
import {
  ChatMessage,
  ConverseData,
  MessageType,
  RawConverseData,
  TextData,
  VisualFormat,
} from '@/Types/ChatMessage'
import { Decision } from '@/Types/ChartRules'
import { NO_DATA_AVAILABLE } from '@/Config'
import { cleanseColumn, formatValue } from '@/Utils/common'

interface Fact {
  dimCount: number
  metCount: number
  dateCount: number
  dim: string[]
  met: string[]
  date: string[]
  columnsCount: number
  dataCount: number
  category: string
  value: string
}

const makeFacts = (
  colType: ColType,
  columns: string[],
  values: { [key: string]: any }[],
): Fact => {
  return {
    dimCount: colType?.dim.length || 0,
    metCount: colType?.metrics.length || 0,
    dateCount: colType?.date.length ?? 0,
    dim: colType?.dim ?? [],
    met: colType?.metrics ?? [],
    date: colType?.date ?? [],
    columnsCount: columns.length ?? 0,
    dataCount: values.length,
    category: '',
    value: '',
  }
}

const makeConverseData = (
  columns: string[],
  columnMetadata: ColumnMetadata,
  values: string | any,
  item: RawConverseData,
  visualFormats: VisualFormat[],
): ConverseData => {
  const { createdAt, id, text = '', utterance } = item

  let formattedValue: TextData = formatValue('', null)
  if (!Array.isArray(values) || values.length === 0) {
    const value = text === '0' || text.length === 0 ? NO_DATA_AVAILABLE : text
    formattedValue = formatValue(value, null)
  } else if (values.length === 1) {
    const [[columnName, value = '']] = Object.entries(values[0])
    const metadata = columnMetadata[columnName]
    if (metadata) {
      formattedValue = formatValue(value, metadata)
    } else {
      console.log(`Metadata not available for column: ${columnName}`)
    }
  }

  return {
    columnMetadata,
    columns,
    createdAt,
    id,
    message: utterance,
    utterance,
    textData: formattedValue,
    values,
    visualFormats,
  }
}

export const makeUserMessage = (message: string): ChatMessage => ({
  // id: uuidv4(),
  id: `u-${Date.now()}`,
  type: MessageType.USER,
  message,
})

export const makeAthenaFailureMessage = (message: string): ChatMessage => {
  return {
    // id: uuidv4(),
    id: `a-${Date.now()}`,
    type: MessageType.ATHENA_ERROR,
    message,
  }
}

export const makeAthenaMessage = (message: ConverseData): ChatMessage => ({
  id: message.id,
  type: MessageType.ATHENA,
  message,
})

type KeyValue = {
  [key: string]: any
}

type MetaData = KeyValue

interface ProcessedResponse {
  columns: string[]
  columnMetadata: MetaData
  values: KeyValue[]
}

const normalizeConverseData = (
  columns: string[],
  column_metadata: MetaData,
  base64Value: string,
): ProcessedResponse => {
  // console.log('[response-processor] Process response...')
  // Decode base64 to array of values
  const decoded = atob(base64Value)
  const valueArr = JSON.parse(decoded)

  // Cleanse column names
  const cleansedColumns = columns.map(cleanseColumn)

  // Cleanse and find numberic columns from metadata
  const col_meta: MetaData = {}
  for (const column of Object.keys(column_metadata)) {
    const { category, data_type, additional_data } = column_metadata[column]
    const isNumericFormat =
      category === 'metrics' ||
      (data_type === 'numeric' && category === 'dimensions') ||
      (category === 'calculatedField' &&
        additional_data?.type !== 'Calculated Dimension' &&
        additional_data?.type !== 'Calculated Date')

    const cleansedColumn = cleanseColumn(column)
    col_meta[cleansedColumn] = { ...column_metadata[column], isNumericFormat }
  }

  // Extract array of name, value pairs
  const values = []
  if (valueArr.length > 0) {
    const colsCount = cleansedColumns.length
    for (const row of valueArr) {
      const record: KeyValue = {}
      for (let index = 0; index < colsCount; index++) {
        const column = cleansedColumns[index]
        // if (colsCount === 1 && valueArr.length === 1) {
        //   console.log(
        //     `[Chart Rule Processor] colsCount: ${cleansedColumns} valueArr.length: ${valueArr.length
        //     }, col_meta: ${JSON.stringify(col_meta, null, 2)}`,
        //   )
        // }
        const { isNumericFormat } = col_meta[column] || {
          isNumericFormat: false,
        }
        record[column] = isNumericFormat ? Number(row[index]) : row[index]
      }
      values.push(record)
    }
  }
  // console.log(`[Chart Rule Processor] Extract array of name, value pairs...`)
  return { columns: cleansedColumns, columnMetadata: col_meta, values }
}

const engine = new Engine()
chartRules.decisions.forEach((decision: Decision) => {
  const { conditions, event } = decision
  engine.addRule({ conditions, event })
})

export const processConverseData = async (item: RawConverseData) => {
  if (item.status === 'failed') {
    const { text, utterance } = item
    const userMessage: ChatMessage = makeUserMessage(utterance)
    const athenaMessage: ChatMessage = makeAthenaFailureMessage(text)
    const converseData = {
      id: item.id,
      textData: formatValue(text, null),
      message: utterance,
      visualFormats: [] as VisualFormat[],
    } as ConverseData
    return { userMessage, athenaMessage, converseData }
  }

  // Process and transform base64 string to array of records
  const { columns, columnMetadata, values } = normalizeConverseData(
    item.columns,
    item.columnMetadata,
    item.base64Data,
  )

  // Find visualization formats
  const colType = item?.colType
  const facts = makeFacts(colType, columns, values)
  const { events } = await engine.run(facts)
  const visualFormats: VisualFormat[] = events.map(event => {
    const { type, params } = event
    let decisions: Record<string, any> = {}
    for (const key in params) {
      // eslint-disable-next-line no-new-func
      const columnName = new Function('facts', `return \`${params[key]}\`;`)(
        facts,
      )
      decisions[key] = cleanseColumn(columnName)
    }
    return {
      ...(decisions as VisualFormat),
      type,
    }
  })

  // Extract separate message for user and athena and add to the message array
  const message = item.utterance
  const userMessage: ChatMessage = makeUserMessage(message)

  const converseData = makeConverseData(
    columns,
    columnMetadata,
    values,
    item,
    visualFormats,
  ) as ConverseData
  const athenaMessage: ChatMessage = makeAthenaMessage(converseData)

  return { userMessage, athenaMessage, converseData }
}

export const processChatHistory = async (rawMessages: RawConverseData[]) => {
  if (rawMessages.length === 0) {
    return []
  }

  let index = 0
  let messages: ChatMessage[] = []
  for (const item of rawMessages) {
    try {
      const { userMessage, athenaMessage } = await processConverseData(item)
      messages = [...messages, userMessage, athenaMessage]
    } catch (error) {
      console.error(
        `[chat-history-processor] ProcessChatHistory - Error while processing message#${index}: `,
        error,
      )
    }
    index++
  }
  return messages
}
