import numeral from 'numeral'
import { ColType, ColumnMetadata } from '@/Types/ChatHistory'
import { TextData } from '@/Types/ChatMessage'
import moment from 'moment'

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

const replaceDateFormats = function (str: string) {
  if (str)
    return (
      str
        .toLowerCase()
        // .replace('%d', 'dd')
        .replace('%d', 'DD')
        .replace('%m', 'MM')
        // .replace('%y', 'yy')
        .replace('%y', 'YYYY')
        .replace('%h', 'hh')
        .replace('%m', 'mm')
        .replace('%s', 'ss')
    )
  else return str
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
    const {
      type,
      unit = '',
      additional_data,
      category,
      isNumericFormat,
    } = metadata

    const precision = additional_data?.precision ?? 0
    const precisionFormat = precision > 0 ? '.'.padEnd(precision + 1, '0') : ''

    let prefix = ''
    let suffix = ''
    let formattedValue = value
    let roundedValue = value
    let abbrValue = value

    if (category === 'date') {
      const dateStr = `${value}`.trim()
      let formattedDateStr = ''
      if (dateStr !== '') {
        const pattern =
          /([0-9]{2}|[0-9]{1})[-/]([0-9]{2}|[0-9]{1})[-/]([0-9]{4}|[0-9]{2})/g
        const result = dateStr.match(pattern)
        const DATE_FORMAT = replaceDateFormats(type.toLowerCase())
        if (result?.length) {
          const [matchedDate] = result
          const [mm, dd, tmpyyyy] = matchedDate.split(/[-/]/)
          const yyyy =
            tmpyyyy.length === 2
              ? `${new Date().getFullYear()}`.slice(0, 2) + tmpyyyy
              : tmpyyyy
          formattedDateStr = moment(`${yyyy}-${mm}-${dd}`).format(DATE_FORMAT)
        } else {
          const tmpFormattedDateStr = moment(dateStr).format(DATE_FORMAT)
          if (tmpFormattedDateStr !== 'Invalid date') {
            formattedDateStr = tmpFormattedDateStr
          }
        }
      }
      formattedValue = formattedDateStr
      roundedValue = formattedDateStr
      abbrValue = formattedDateStr
    } else if (!isNumericFormat || category === 'flag') {
      formattedValue = value
      roundedValue = value
      abbrValue = value
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

export const dataFormatter = (
  value: any,
  metadata: { [key: string]: any },
  formatter?: (value: string, isNumeric: boolean) => string | JSX.Element,
) => {
  let displayValue = `${value}`
  let isNumeric = false
  if (metadata?.isNumericFormat || metadata?.category === 'date') {
    isNumeric = true
    const { prefix, value: text, suffix } = formatValue(value, metadata)
    displayValue = `${prefix}${text} ${suffix}`.trim()
  }
  return formatter ? formatter(displayValue, isNumeric) : displayValue
}

export const getFormattedRowData = (
  columns: string[],
  columnMetadata: ColumnMetadata,
  row: Record<string, any>,
  formatter?: (value: string, isNumeric: boolean) => string | JSX.Element,
) => {
  return columns.map(column =>
    dataFormatter(row[column], columnMetadata[column], formatter),
  )
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

export const makeTestID = (id: string) => ({ testID: `test:id/${id}` })

let timerId: NodeJS.Timeout

/**
 *
 * @param func a function which needs to be debounced
 * @param delay is the debounced time in milliseconds
 */
export const debounce = (func: () => void, delay: number) => {
  // Cancels the setTimeout method execution
  clearTimeout(timerId)

  // Executes the func after delay time.
  timerId = setTimeout(func, delay)
}

let throttleTimerId: NodeJS.Timeout | undefined
export const throttle = (func: () => void, delay: number) => {
  // If setTimeout is already scheduled, no need to do anything
  if (throttleTimerId) {
    return
  }

  // Schedule a setTimeout after delay seconds
  throttleTimerId = setTimeout(() => {
    func()

    // Once setTimeout function execution is finished, timerId = undefined so that in <br>
    // the next scroll event function execution can be scheduled by the setTimeout
    throttleTimerId = undefined
  }, delay)
}

export const buildOrderedColumns = (
  isColumnReorder: boolean,
  colType: ColType,
  columns: string[],
) => {
  const date = colType?.date ?? []
  const dim = colType?.dim ?? []
  const metrics = colType?.metrics ?? []
  return isColumnReorder ? ([] as string[]).concat(date, dim, metrics) : columns
}
