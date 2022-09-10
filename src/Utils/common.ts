import numeral from 'numeral'
import { ColumnMetadata } from '@/Types/ChatHistory'
import { TextData } from '@/Types/ChatMessage'

export const cleanseColumn = (str: string) => {
  if (str) {
    str = str.replace(/[. \- %()#&>]/g, '_')
    const rex = new RegExp('^[0-9]')
    str = rex.test(str) ? `_${str}` : str
  }
  return str
}

export const isStringExists = (str: string, subStr: string) => {
  return !(str.indexOf(subStr) === -1)
}

export const abbrevateNumber = (value: number) => {
  if (value < 1e3) {
    return value
  }
  if (value >= 1e3 && value < 1e6) {
    return +(value / 1e3).toFixed(1) + 'K'
  }
  if (value >= 1e6 && value < 1e9) {
    return +(value / 1e6).toFixed(1) + 'M'
  }
  if (value >= 1e9 && value < 1e12) {
    return +(value / 1e9).toFixed(1) + 'B'
  }
  if (value >= 1e12) {
    return +(value / 1e12).toFixed(1) + 'T'
  }
}

/**
 * Converts given text to proper case text. For Eg. "helLo woRLD" into "Hello World"
 * @param text string
 * @param onlyFirstChar boolean
 * @returns Proper case text
 */
export const properCase = (text: string, onlyFirstChar = false) => {
  let result = ''
  try {
    if (text === null || text === undefined || `${text}`.length === 0) {
      result = ''
    }
    if (onlyFirstChar) {
      result = text.charAt(0).toUpperCase() + text.slice(1)
    } else {
      result = text.replace(/\w\S*/g, str => {
        return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase()
      })
    }
  } catch (error) {
    console.error(`[Utils] properCase text: ${text}`, error)
  } finally {
    return result
  }
}

export const formatValue = (
  value: any,
  metadata: ColumnMetadata | null,
): TextData => {
  let data: TextData = {
    prefix: '',
    value: isNaN(value) ? value : numeral(value).format('0,0'),
    roundedValue: isNaN(value) ? value : numeral(value).format('0,0'),
    abbrValue: isNaN(value) ? value : numeral(value).format('0.00a'),
    suffix: '',
  }

  if (metadata) {
    const { type, unit = '', additional_data, category, isNumericFormat } = metadata

    const precision = additional_data?.precision ?? 0
    const precisionFormat = precision > 0 ? '.'.padEnd(precision + 1, '0') : ''

    let prefix = ''
    let suffix = ''
    let formattedValue = value
    let roundedValue = value
    let abbrValue = value

    if (!isNumericFormat || category === 'flag') {
      formattedValue = value
      roundedValue = value
      abbrValue = value
    } else if (category === 'date') {
      const datetimeArr = `${value}`.split(' ')
      formattedValue = datetimeArr[0]
      roundedValue = datetimeArr[0]
      abbrValue = datetimeArr[0]
    } else if (type === 'currency') {
      const currency = unit ? unit : ''
      // if (currency === '$') {
      prefix = currency
      // } else {
      //   suffix = currency
      // }
      formattedValue = numeral(value).format(`0,0${precisionFormat}`)
      roundedValue = numeral(value).format('0,0')
      abbrValue = numeral(value).format('0.00a')
    } else {
      if (unit && `${unit}`.length) {
        suffix = unit
      }
      formattedValue = numeral(value).format(`0,0${precisionFormat}`)
      roundedValue = numeral(value).format('0,0')
      abbrValue = numeral(value).format('0.00a')
    }

    data = {
      prefix,
      value: formattedValue,
      roundedValue,
      abbrValue,
      suffix,
    }
  }
  return data
}

type Extractor<T, P> = (item: T) => P

function getNextBatch<T, P>(
  arr: Array<T>,
  offset: number,
  limit: number,
  extractor?: Extractor<T, P>,
): T[] | P[] {
  const result = arr.slice(offset, offset + limit)
  if (extractor) {
    return result.map(extractor)
  }
  return result
}

export function* generateBatches<T, P>(
  arr: T[],
  initialSize: number,
  successiveSize: number,
  extractor?: Extractor<T, P>,
) {
  let offset = 0

  // Initial batch of result
  yield getNextBatch(arr, offset, initialSize, extractor)
  offset += initialSize

  // Successive batches of result
  while (offset < arr.length) {
    yield getNextBatch(arr, offset, successiveSize, extractor)
    offset += successiveSize
  }
}
