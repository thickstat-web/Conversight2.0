import { Engine } from 'json-rules-engine'
import { processResponse } from '@/Utils/response-processor'
import chartRules from '@/Config/chart-rules.json'
import { ColumnMetadata, Message } from '@/Types/ChatHistory'
import { AthenaMessage, ChatMessage, UserMessage } from '@/Types/ChatMessage'
import { Decision } from '@/Types/ChartRules'

const makeFacts = (
  colType: any,
  columns: string[],
  values: { [key: string]: any }[],
) => {
  return {
    dimCount: colType?.dim.length ?? 0,
    metCount: colType?.metrics.length ?? 0,
    dateCount: colType?.date.length ?? 0,
    dim: colType?.dim ?? [],
    met: colType?.metrics ?? [],
    date: colType?.date ?? [],
    columnsCount: columns.length ?? 0,
    dataCount: values.length,
  }
}

const makeUserMessage = (item: Message, values: string | any[]) => {
  const { displayUtterance, utterance } = item
  return {
    isAthena: false,
    message: displayUtterance.length ? displayUtterance : utterance,
  }
}

const makeAthenaMessage = (
  columns: string[],
  columnMetadata: ColumnMetadata,
  values: string | any,
  item: Message,
  visualFormats: string[],
) => {
  const { createdAt, ID, displayUtterance, text, utterance } = item

  let message = displayUtterance.length ? displayUtterance : utterance
  if (Array.isArray(values) && values.length === 0 && text === '0') {
    message = 'Response not available'
  }

  return {
    columns,
    columnMetadata,
    createdAt: createdAt,
    data: values,
    id: ID,
    isAthena: true,
    message,
    utterance: utterance,
    visualFormats,
  }
}

export const processChatHistory = async (chatHistoryMessages: Message[]) => {
  const engine = new Engine()
  chartRules.decisions.forEach((decision: Decision) => {
    const { conditions, event } = decision
    engine.addRule({ conditions, event })
  })

  let index = 0
  let messages: ChatMessage[] = []
  for (const item of chatHistoryMessages) {
    try {
      const { columns, column_metadata, values } = processResponse(
        item.columns,
        item.column_metadata,
        item.val,
      )
      const colType = item?.colType
      const facts = makeFacts(colType, columns, values)
      const { events } = await engine.run(facts)
      const visualFormats = events.map(event => event?.type)

      const userMessage: UserMessage = makeUserMessage(item, values)
      const athenaMessage: AthenaMessage = makeAthenaMessage(
        columns,
        column_metadata,
        values,
        item,
        visualFormats,
      )
      messages = messages.concat(userMessage, athenaMessage)
    } catch (error) {
      console.error(`[Process History] error while processing ${index}:`, error)
    }
    index++
  }
  return messages
}
