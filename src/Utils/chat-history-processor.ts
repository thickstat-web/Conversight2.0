import { AthenaFailureMessage } from './../Types/ChatMessage';
import { Engine } from 'json-rules-engine'
import { processResponse } from '@/Utils/response-processor'
import chartRules from '@/Config/chart-rules.json'
import { cleanseColumn } from '@/Utils/common'
import { ColumnMetadata } from '@/Types/ChatHistory'
import {
  AthenaMessage,
  ChatMessage,
  RawChatMessage,
  UserMessage,
  VisualFormat,
} from '@/Types/ChatMessage'
import { Decision } from '@/Types/ChartRules'

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

declare type ChartType =
  | 'AreaChart'
  | 'BarChart'
  | 'ColumnChart'
  | 'DonutChart'
  | 'DualAxes'
  | 'FunnelChart'
  | 'LineChart'
  | 'PieChart'

const makeFacts = (
  colType: { [key: string]: string[] },
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
    value: 0,
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
  if (Array.isArray(values) && values.length === 0 && text === '0') {
    message = 'Response not available'
  }

  return {
    columns,
    columnMetadata,
    createdAt,
    data: values,
    id: `a-${id}`,
    isAthena: true,
    message,
    utterance,
    visualFormats,
  }
}

const getAxis = (chartType: ChartType, facts: Fact) => {
  let result = null
  switch (chartType) {
    case 'AreaChart':
      result = {
        xField:
          facts.date.length >= 1
            ? facts.date[0]
            : facts.dim.length >= 1
              ? facts.dim[0]
              : '',
        yField: facts.value ? facts.value : facts.met[0],
        seriesField: facts.category
          ? facts.category
          : facts.date.length > 1
            ? facts.date[1]
            : facts.dim.length > 1
              ? facts.dim[1]
              : facts.date.length
                ? facts.dim[0]
                : '',
      }
      break

    case 'BarChart':
      result = {
        xField:
          facts.date.length >= 1
            ? facts.date[0]
            : facts.dim.length >= 1
              ? facts.dim[0]
              : '',
        yField: facts.met[0],
        seriesField:
          facts.date.length > 1
            ? facts.date[1]
            : facts.dim.length > 1
              ? facts.dim[1]
              : facts.date.length
                ? facts.dim[0]
                : '',
        isStack:
          facts.dim[1] || facts.date[1]
            ? facts.dataCount > 50
              ? true
              : false
            : false,
        isGroup:
          facts.dim[1] || facts.date[1]
            ? facts.dataCount < 50
              ? true
              : false
            : false,
      }
      break
    case 'ColumnChart':
      result = {
        xField:
          facts.date.length >= 1
            ? facts.date[0]
            : facts.dim.length >= 1
              ? facts.dim[0]
              : '',
        yField: facts.met[0],
        seriesField:
          facts.date.length > 1
            ? facts.date[1]
            : facts.dim.length > 1
              ? facts.dim[1]
              : facts.date.length
                ? facts.dim[0]
                : '',
        isStack:
          facts.dim[1] || facts.date[1]
            ? facts.dataCount > 50
              ? true
              : false
            : false,
        isGroup:
          facts.dim[1] || facts.date[1]
            ? facts.dataCount < 50
              ? true
              : false
            : false,
      }
      break
    case 'DonutChart':
      result = {
        colorField: facts.dim[0] || facts.date[0],
        angleField: facts.met[0],
      }
      break
    case 'DualAxes':
      result = {
        xField: facts.date[0] || facts.dim[0],
        yField: facts.met,
      }
      break
    case 'FunnelChart':
      result = {
        xField: facts.date[0] || facts.dim[0],
        yField: facts.met[0],
      }
      break
    case 'LineChart':
      result = {
        xField:
          facts.date.length >= 1
            ? facts.date[0]
            : facts.dim.length >= 1
              ? facts.dim[0]
              : '',
        yField: facts.value ? facts.value : facts.met[0],
        seriesField: facts.category
          ? facts.category
          : facts.date.length > 1
            ? facts.date[1]
            : facts.dim.length > 1
              ? facts.dim[1]
              : facts.date.length
                ? facts.dim[0]
                : '',
      }
      break
    case 'PieChart':
      result = {
        xField: facts.dim[0] || facts.date[0],
        yField: facts.met[0],
      }
      break
    default:
      result = {
        xField: '',
        yField: '',
        isStack: false,
        isGroup: false,
      }
      break
  }
  return result
}

const engine = new Engine()
chartRules.decisions.forEach((decision: Decision) => {
  const { conditions, event } = decision
  engine.addRule({ conditions, event })
})

export const processChatMessage = async (item: RawChatMessage) => {
  console.log('[chat-history-processor] processChatMessage...')
  // Process and transform base64 string to array of records
  const { columns, columnMetadata, values } = processResponse(
    item.columns,
    item.columnMetadata,
    item.base64Data,
  )

  // Find visualization formats
  const colType = item?.colType
  const facts = makeFacts(colType, columns, values)
  // console.log(
  //   `[Chart Rule Processor]facts: ${JSON.stringify(facts, null, 2)}`,
  // )
  const { events } = await engine.run(facts)
  const visualFormats: VisualFormat[] = events.map(event => {
    const { type } = event
    const {
      xField = '',
      yField = '',
      isStack = false,
      isGroup = false,
    } = getAxis(type as ChartType, facts)
    return {
      type,
      xAxisField: cleanseColumn(xField),
      yAxisField:
        typeof yField === 'string'
          ? cleanseColumn(yField)
          : yField.map(field => cleanseColumn(field)),
      isStack,
      isGroup,
    }
  })
  console.log(
    '[HistoryData] Visual Formats:',
    JSON.stringify(visualFormats, null, 2),
  )

  if (visualFormats.find(item => item.type === 'Text')) {
    console.log(
      '[chat-history-processor] values: ',
      JSON.stringify(values, 2, null),
    )
  } else {
    console.log('[chat-history-processor] values length: ', values.length)
  }

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
        `[TransformHelper] ProcesChatistory - Error while processing ${index}: `,
        error,
      )
    }
    index++
  }
  return messages
}
