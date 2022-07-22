import numeral from 'numeral'
import { ColumnMetadata } from '@/Types/ChatHistory'

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

export const formatValue = (value: any, metadata: ColumnMetadata) => {
  const { type, unit = '', additional_data } = metadata
  const precision = additional_data?.precision ?? 0
  let valueFormat = '0,0'
  const precisionFormat = precision > 0 ? '.'.padEnd(precision + 1, '0') : ''

  if (type === 'currency') {
    const currency = unit ? unit : ''
    valueFormat =
      currency === '$'
        ? `${currency}0,0${precisionFormat}`
        : `0,0${precisionFormat}${currency}`
  } else {
    valueFormat =
      unit && `${unit}`.length
        ? `0,0${precisionFormat}${unit}`
        : `0,0${precisionFormat}`
  }

  return numeral(value).format(valueFormat)
}
