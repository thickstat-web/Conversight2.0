import { atob } from 'react-native-quick-base64'
import { cleanseColumn } from '@/Utils/common'

type MetaData = {
  [key: string]: any
}

export const processResponse = (
  columns: string[],
  column_metadata: MetaData,
  base64Value: string,
) => {
  const decoded = atob(base64Value)
  const valueArr = JSON.parse(decoded)
  const cleansedColumns = columns.map(cleanseColumn)
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

  const values = []
  const init: MetaData = {}
  for (const row of valueArr) {
    const record = cleansedColumns.reduce((acc, column, index) => {
      const { isNumericFormat } = col_meta[column]
      acc[column] = isNumericFormat ? Number(row[index]) : row[index]
      return acc
    }, init)
    values.push(record)
  }
  return { columns: cleansedColumns, column_metadata: col_meta, values }
}
