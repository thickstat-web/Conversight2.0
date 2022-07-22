import { Engine } from 'json-rules-engine'
import { atob } from 'react-native-quick-base64'
import chartRules from '@/Config/chart-rules.json'
import { AthenaFailureMessage } from './../Types/ChatMessage'
import { cleanseColumn, formatValue } from '@/Utils/common'
import { ColType, ColumnMetadata } from '@/Types/ChatHistory'
import {
  AthenaMessage,
  ChatMessage,
  RawChatMessage,
  UserMessage,
  VisualFormat,
} from '@/Types/ChatMessage'
import { Decision } from '@/Types/ChartRules'
import { NO_DATA_AVAILABLE } from '@/Config'

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

const makeUserMessage = (item: RawChatMessage) => {
  const { displayUtterance, utterance, id } = item
  return {
    id: `u-${id}`,
    message: displayUtterance.length ? displayUtterance : utterance,
    isAthena: false,
  }
}

export const makeFailureAthenaMessage = (
  message: string,
): AthenaFailureMessage => {
  return {
    id: `a-${Date.now()}`,
    isAthena: true,
    message,
    visualFormats: [{ type: 'Error' } as VisualFormat],
    data: [{ message }],
  }
}

const makeAthenaMessage = (
  columns: string[],
  columnMetadata: ColumnMetadata,
  values: string | any,
  item: RawChatMessage,
  visualFormats: VisualFormat[],
) => {
  const { createdAt, id, displayUtterance, text, utterance } = item

  let message = displayUtterance.length ? displayUtterance : utterance
  let displayValue = ''
  if (!Array.isArray(values) || values.length === 0) {
    displayValue = text === '0' ? NO_DATA_AVAILABLE : text
  } else if (values.length === 1) {
    const [[columnName, value]] = Object.entries(values[0])
    displayValue = formatValue(value, columnMetadata[columnName])
    if (
      columnMetadata[columnName] !== undefined &&
      columnMetadata[columnName].category === 'date'
    ) {
      const datetimeArr = `${value}`.split(' ')
      displayValue = datetimeArr[0]
    }
  }

  return {
    columnMetadata,
    columns,
    createdAt,
    id: `a-${id}`,
    isAthena: true,
    message,
    utterance,
    value: displayValue,
    values,
    visualFormats,
  }
}

type KeyValue = {
  [key: string]: any
}

interface MetaData extends KeyValue { }

interface ProcessedResponse {
  columns: string[]
  columnMetadata: MetaData
  values: KeyValue[]
}

const processResponse = (
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

export const processChatMessage = async (item: RawChatMessage) => {
  // console.log('[chat-history-processor] processChatMessage...')
  // Process and transform base64 string to array of records
  const { columns, columnMetadata, values } = processResponse(
    item.columns,
    item.columnMetadata,
    item.base64Data,
  )
  // console.log(`[Chart Rule Processor] Response processed columns: ${JSON.stringify(columns, null, 2)}`)

  // Find visualization formats
  const colType = item?.colType
  const facts = makeFacts(colType, columns, values)
  // console.log(`[Chart Rule Processor] facts: ${JSON.stringify(facts, null, 2)}`)
  const { events } = await engine.run(facts)
  // console.log('[Chart Rule Processor] rule run compelte...')
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
  // console.log(
  //   '[HistoryData] Visual Formats:',
  //   JSON.stringify(visualFormats, null, 2),
  // )

  // if (visualFormats.find(item => item.type === 'Text')) {
  //   console.log(
  //     '[chat-history-processor] values: ',
  //     JSON.stringify(values, 2, null),
  //   )
  // } else {
  //   console.log('[chat-history-processor] values length: ', values.length)
  // }

  // Extract separate message for user and athena and add to the message array
  const userMessage: UserMessage = makeUserMessage(item)
  const athenaMessage: AthenaMessage = makeAthenaMessage(
    columns,
    columnMetadata,
    values,
    item,
    visualFormats,
  )
  return { userMessage, athenaMessage }
}

export const processChatHistory = async (rawChatMessages: RawChatMessage[]) => {
  if (rawChatMessages.length === 0) {
    return []
  }

  let index = 0
  let messages: ChatMessage[] = []
  for (const item of rawChatMessages) {
    try {
      const { userMessage, athenaMessage } = await processChatMessage(item)
      messages = messages.concat(userMessage, athenaMessage)
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
