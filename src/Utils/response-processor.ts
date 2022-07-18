import { atob } from 'react-native-quick-base64'
import { cleanseColumn } from '@/Utils/common'

type KeyValue = {
  [key: string]: any
}

interface MetaData extends KeyValue { }

interface ProcessedResponse {
  columns: string[]
  columnMetadata: MetaData
  values: KeyValue[]
}

export const processResponse = (
  columns: string[],
  column_metadata: MetaData,
  base64Value: string,
  text: string,
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
  if (valueArr.length === 0) {
    values.push({ result: text })
  } else {
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
