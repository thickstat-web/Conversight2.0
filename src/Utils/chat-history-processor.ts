import { AthenaFailureMessage } from './../Types/ChatMessage'
import { Engine } from 'json-rules-engine'
import { processResponse } from '@/Utils/response-processor'
import chartRules from '@/Config/chart-rules.json'
import { cleanseColumn } from '@/Utils/common'
import { ColType, ColumnMetadata } from '@/Types/ChatHistory'
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
    item.text,
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
        `[chat-history-processor] ProcesChatistory - Error while processing message#${index}: `,
        error,
      )
    }
    index++
  }
  return messages
}
