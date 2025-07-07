import numeral from 'numeral'
import moment from 'moment'
import { ColType, ColumnMetadata } from '@/Types/ChatHistory'
import { TextData } from '@/Types/ChatMessage'
import { uniq, find, map, groupBy, cloneDeep, filter, List } from 'lodash';
import { setLocalStore } from './asyncStorage';
import { atob, btoa } from 'react-native-quick-base64'

// Base64 utility for encoding strings
export const Base64 = {
  encode: (str: string): string => {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
      console.error('Base64 encoding error:', e);
      return '';
    }
  },
  decode: (str: string): string => {
    try {
      return decodeURIComponent(escape(atob(str)));
    } catch (e) {
      console.error('Base64 decoding error:', e);
      return '';
    }
  }
};

interface AdditionalData {
  aggregation: string;
  is_create: boolean;
  is_update: boolean;
  precision: number;
  type: string;
}

interface MetaData {
  processedID?: string;
  additional_data: AdditionalData;
  unit: string;
  type: string;
  target_type: string;
  table: string;
  synonym: string;
  rank: number;
  is_default: boolean;
  id: string;
  default_synonym: string;
  data_type: string;
  data_set: string;
  category: string;
  athena_visibility: boolean;
  alias: string;
  column_name: string;
}

interface Meta {
  editedContent: { operatorValue: any; dateValues: any[]; inputValue: any; inputValueNumber: any; inputValueNumberTo: any };
  processedID: string;
  table: any;
  id: any;
  category: string;
  type: any;
}

interface SelectFnItem {
  type: any;
  editedContent: any;
  category: string;
  table: string;
  id: string;
  processedID?: string;
  additional_data: any;
  athena_visibility?: boolean;
  data_set?: string;
  data_type?: string;
  label?: string;
  is_default?: boolean;
  rank?: number;
  mapd_datatype?: string;
  unit?: string;
}
export const cleanseColumn = (str: string, replaceChar: string = '_') => {
  if (str) {
    str = str.replace(/[. \- %()#&>_]/g, replaceChar)
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
        return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase()
      })
    }
  } catch (error) {
    console.error(`[Utils] properCase text: ${text}`, error)
  } finally {
    return result
  }
}

const replaceDateFormats = function (str: string) {
  if (str) {
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
  } else {
    return str
  }
}

const makeDefaultFormattedData = (value: any): TextData => {
  const isNumber = !isNaN(value)
  const numObj = numeral(value)
  return {
    prefix: '',
    value: isNumber ? numObj.format('0,0') : value,
    roundedValue: isNumber ? numObj.format('0,0') : value,
    abbrValue: isNumber ? numObj.format('0.00a') : value,
    suffix: '',
  }
}

export const formatValue = (
  value: any,
  metadata: ColumnMetadata | null,
): TextData => {
  let data: TextData = makeDefaultFormattedData(value)
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
      prefix = currency
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

export const getDisplayName = (
  column: string,
  columnMetadata: ColumnMetadata,
) => {
  const columnName =
    columnMetadata && columnMetadata[column] && columnMetadata[column].alias
      ? columnMetadata[column].alias
      : cleanseColumn(column, ' ')
  return columnName.trim()
}

export function getDatasetInfo(
  dataSets: any[],
  selectedDatasetId: string | null,
  moment: typeof import('moment'),
) {
  const filteredDatasetName = dataSets.filter(val => {
    return val.dataSetID === selectedDatasetId
  })

  const activeDatasetName = filteredDatasetName.map(val => {
    return val.datasetName
  })

  const datasetRefreshedTime = filteredDatasetName.map(val => {
    return val.republishCompletedTime
  })

  const relativeTime = moment(new Date(datasetRefreshedTime)).fromNow()

  return {
    activeDatasetName: activeDatasetName[0],
    relativeTime: relativeTime,
  }
}



export const mergeDatasetConfigResponses = (defaultConfig: any, datasetData: any, operators: any) => {
  // Merge data from first two endpoints
  const mergedData = {
    ...datasetData.data,
    ...defaultConfig,
  };

  // Transform category structure
  if (mergedData.category) {
    mergedData.category = mergedData.category.map((item: any) => {
      const newItem = { ...item, children: item.type };
      delete newItem.type;

      newItem.children = newItem.children.map((type: any) => {
        const newType = { ...type, children: type.unit };
        newType.children = uniq(newType.children).map((value: any) => ({
          id: value,
          name: value,
        }));
        delete newType.unit;
        return newType;
      });

      return newItem;
    });
  }

  // Add operators
  const mergedConfig = {
    ...mergedData,
    operators: {
      ...operators,
      form: operators.form || [{ id: 'in', name: 'in' }],
      'calculated metric': operators['calculated metric'] || operators.metrics || [{ id: 'is', name: 'is' }],
      'calculated dimension': operators['calculated dimension'] || operators.dimensions || [{ id: 'is', name: 'is' }],
      'calculated date': operators['calculated date'] || operators.date || [{ id: 'is', name: 'is' }],
      'Smart Column': operators['Smart Column'] || [{ id: 'is', name: 'is' }],
    },
  };
  setLocalStore('conversight.dataset.config', mergedConfig);

  // Get metric types for numeric format
  const types = find(mergedConfig.category, { id: 'metrics' });
  const formatCheck = types ? map(types.children, 'id') : [];

  setLocalStore('conversight.dataset.config.dimensionMetricType', formatCheck)

  return {
    config: mergedConfig,
    dimensionMetricTypes: formatCheck,
  };
};


export const UUID = () => {
  let d = new Date().getTime();
  let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0; // Time in microseconds since page-load or 0 if unsupported
  const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return 'cs-' + id;
};


export const FilterByActiveDatasets = (datasetList: Array<any>, activeFailed?: boolean) => {
  if (activeFailed) {
    return (
      datasetList?.filter((data: any) => {
        return (
          (data.access) &&
          ((data.status === 'Active' && !!(data.flow_status === '' || data.flow_status === 'Active')) ||
            data.status === 'Failed' ||
            data.status === 'FailedDependency')
        );
      }) || []
    );
  } else {
    return (
      datasetList?.filter((data: any) => {
        return (
          (data.access) &&
          data.status === 'Active' &&
          !!(data.flow_status === '' || data.flow_status === 'Active')
        );
      }) || []
    );
  }
};

const single_period = ['today', 'yesterday', 'tomorrow'];

const date_mapping = {
  between: `( '/dimensions/dflt_date', 'between', '@period/year-period/@column', 'retainFilter' )`,
  yesterday: `( '(*yesterday*)/date/@column', '=', '(*yesterday*)', 'retainFilter' )`,
  today: `( '(*today*)/date/@column', '=', '(*today*)', 'retainFilter' )`,
  tomorrow: `( '(*tomorrow*)/date/@column', '=', '(*tomorrow*)', 'retainFilter' )`,

  // Week
  'last week': `( '/dimensions/dflt_date', 'between', 'last week/week-period/@column', 'retainFilter' )`,
  'this week': `( '/dimensions/dflt_date', 'between', 'this week/week-period/@column', 'retainFilter' )`,
  'next week': `( '/dimensions/dflt_date', 'between', 'next week/week-period/@column', 'retainFilter' )`,
  'this week to date': `( '/dimensions/dflt_date', 'between', 'this #$ytd/week-period/@column', 'retainFilter' )`,
  'last wtd': `( '/dimensions/dflt_date', 'between', 'last #$wtd/week-period/@column', 'retainFilter' )`,
  'this wtd': `( '/dimensions/dflt_date', 'between', 'this #$wtd/week-period/@column', 'retainFilter' )`,
  'last #$wtd': `( '/dimensions/dflt_date', 'between', 'last #$wtd/week-period/@column', 'retainFilter' )`,
  'this #$wtd': `( '/dimensions/dflt_date', 'between', 'this #$wtd/week-period/@column', 'retainFilter' )`,

  // Month
  'this month': `( '/dimensions/dflt_date', 'between', 'this month/month-period/@column', 'retainFilter' )`,
  'this month to date': `( '/dimensions/dflt_date', 'between', 'this #$mtd/month-period/@column', 'retainFilter' )`,
  'last mtd': `( '/dimensions/dflt_date', 'between', 'last #$mtd/month-period/@column', 'retainFilter' )`,
  'this mtd': `( '/dimensions/dflt_date', 'between', 'this #$mtd/month-period/@column', 'retainFilter' )`,
  'last #$mtd': `( '/dimensions/dflt_date', 'between', 'last #$mtd/month-period/@column', 'retainFilter' )`,
  'this #$mtd': `( '/dimensions/dflt_date', 'between', 'this #$mtd/month-period/@column', 'retainFilter' )`,
  'last month': `( '/dimensions/dflt_date', 'between', 'last month/month-period/@column', 'retainFilter' )`,
  'next month': `( '/dimensions/dflt_date', 'between', 'next month/month-period/@column', 'retainFilter' )`,

  // Quarter
  'this quarter': `( '/dimensions/dflt_date', 'between', 'this quarter/quarter-period/@column', 'retainFilter' )`,
  'last quarter': `( '/dimensions/dflt_date', 'between', 'last quarter/quarter-period/@column', 'retainFilter' )`,
  'next quarter': `( '/dimensions/dflt_date', 'between', 'next quarter/quarter-period/@column', 'retainFilter' )`,
  'this quarter to date': `( '/dimensions/dflt_date', 'between', 'this #$qtd/quarter-period/@column', 'retainFilter' )`,
  'last qtd': `( '/dimensions/dflt_date', 'between', 'last #$qtd/quarter-period/@column', 'retainFilter' )`,
  'this qtd': `( '/dimensions/dflt_date', 'between', 'this #$qtd/quarter-period/@column', 'retainFilter' )`,
  'last #$qtd': `( '/dimensions/dflt_date', 'between', 'last #$qtd/quarter-period/@column', 'retainFilter' )`,
  'this #$qtd': `( '/dimensions/dflt_date', 'between', 'this #$qtd/quarter-period/@column', 'retainFilter' )`,

  // Year
  'last calendar year': `( '/dimensions/dflt_date', 'between', 'last cy/year-period/@column', 'retainFilter' )`,
  'this calendar year': `( '/dimensions/dflt_date', 'between', 'this cy/year-period/@column', 'retainFilter' )`,
  'last financial year': `( '/dimensions/dflt_date', 'between', 'last fy/year-period/@column', 'retainFilter' )`,
  'this financial year': `( '/dimensions/dflt_date', 'between', 'this fy/year-period/@column', 'retainFilter' )`,
  'last cy': `( '/dimensions/dflt_date', 'between', 'last cy/year-period/@column', 'retainFilter' )`,
  'this cy': `( '/dimensions/dflt_date', 'between', 'this cy/year-period/@column', 'retainFilter' )`,
  'last fy': `( '/dimensions/dflt_date', 'between', 'last fy/year-period/@column', 'retainFilter' )`,
  'this fy': `( '/dimensions/dflt_date', 'between', 'this fy/year-period/@column', 'retainFilter' )`,
  'last year': `( '/dimensions/dflt_date', 'between', 'last year/year-period/@column', 'retainFilter' )`,
  'this year': `( '/dimensions/dflt_date', 'between', 'this year/year-period/@column', 'retainFilter' )`,
  'next year': `( '/dimensions/dflt_date', 'between', 'next year/year-period/@column', 'retainFilter' )`,
  'this year to date': `( '/dimensions/dflt_date', 'between', 'this #$ytd/year-period/@column', 'retainFilter' )`,
  'last ytd': `( '/dimensions/dflt_date', 'between', 'last #$ytd/year-period/@column', 'retainFilter' )`,
  'this ytd': `( '/dimensions/dflt_date', 'between', 'this #$ytd/year-period/@column', 'retainFilter' )`,
  'last #$ytd': `( '/dimensions/dflt_date', 'between', 'last #$ytd/year-period/@column', 'retainFilter' )`,
  'this #$ytd': `( '/dimensions/dflt_date', 'between', 'this #$ytd/year-period/@column', 'retainFilter' )`,

  // Last X Days + Singular
  'last 30 days': "( '/dimensions/dflt_date', 'between', 'last 30 day/year-period/@column', 'retainFilter' )",
  'last 30 day': "( '/dimensions/dflt_date', 'between', 'last 30 day/year-period/@column', 'retainFilter' )",
  'last 60 days': "( '/dimensions/dflt_date', 'between', 'last 60 day/year-period/@column', 'retainFilter' )",
  'last 60 day': "( '/dimensions/dflt_date', 'between', 'last 60 day/year-period/@column', 'retainFilter' )",
  'last 90 days': "( '/dimensions/dflt_date', 'between', 'last 90 day/year-period/@column', 'retainFilter' )",
  'last 90 day': "( '/dimensions/dflt_date', 'between', 'last 90 day/year-period/@column', 'retainFilter' )",
  'last 180 days': "( '/dimensions/dflt_date', 'between', 'last 180 day/year-period/@column', 'retainFilter' )",
  'last 180 day': "( '/dimensions/dflt_date', 'between', 'last 180 day/year-period/@column', 'retainFilter' )",
  'last 360 days': "( '/dimensions/dflt_date', 'between', 'last 360 day/year-period/@column', 'retainFilter' )",
  'last 360 day': "( '/dimensions/dflt_date', 'between', 'last 360 day/year-period/@column', 'retainFilter' )",

  // Last X Months + Singular
  'last 3 months': "( '/dimensions/dflt_date', 'between', 'last 3 month/month-period/@column', 'retainFilter' )",
  'last 3 month': "( '/dimensions/dflt_date', 'between', 'last 3 month/month-period/@column', 'retainFilter' )",
  'last 6 months': "( '/dimensions/dflt_date', 'between', 'last 6 month/month-period/@column', 'retainFilter' )",
  'last 6 month': "( '/dimensions/dflt_date', 'between', 'last 6 month/month-period/@column', 'retainFilter' )",
  'last 12 months': "( '/dimensions/dflt_date', 'between', 'last 12 month/month-period/@column', 'retainFilter' )",
  'last 12 month': "( '/dimensions/dflt_date', 'between', 'last 12 month/month-period/@column', 'retainFilter' )",

  // Last X Quarters + Singular
  'last 2 quarters': "( '/dimensions/dflt_date', 'between', 'last 2 quarter/quarter-period/@column', 'retainFilter' )",
  'last 2 quarter': "( '/dimensions/dflt_date', 'between', 'last 2 quarter/quarter-period/@column', 'retainFilter' )",
  'last 4 quarters': "( '/dimensions/dflt_date', 'between', 'last 4 quarter/quarter-period/@column', 'retainFilter' )",
  'last 4 quarter': "( '/dimensions/dflt_date', 'between', 'last 4 quarter/quarter-period/@column', 'retainFilter' )",

  // Next X Days + Singular
  'next 30 days': "( '/dimensions/dflt_date', 'between', 'next 30 day/year-period/@column', 'retainFilter' )",
  'next 30 day': "( '/dimensions/dflt_date', 'between', 'next 30 day/year-period/@column', 'retainFilter' )",
  'next 60 days': "( '/dimensions/dflt_date', 'between', 'next 60 day/year-period/@column', 'retainFilter' )",
  'next 60 day': "( '/dimensions/dflt_date', 'between', 'next 60 day/year-period/@column', 'retainFilter' )",
  'next 90 days': "( '/dimensions/dflt_date', 'between', 'next 90 day/year-period/@column', 'retainFilter' )",
  'next 90 day': "( '/dimensions/dflt_date', 'between', 'next 90 day/year-period/@column', 'retainFilter' )",
  'next 180 days': "( '/dimensions/dflt_date', 'between', 'next 180 day/year-period/@column', 'retainFilter' )",
  'next 180 day': "( '/dimensions/dflt_date', 'between', 'next 180 day/year-period/@column', 'retainFilter' )",
  'next 360 days': "( '/dimensions/dflt_date', 'between', 'next 360 day/year-period/@column', 'retainFilter' )",
  'next 360 day': "( '/dimensions/dflt_date', 'between', 'next 360 day/year-period/@column', 'retainFilter' )",

  // Next X Months + Singular
  'next 3 months': "( '/dimensions/dflt_date', 'between', 'next 3 month/month-period/@column', 'retainFilter' )",
  'next 3 month': "( '/dimensions/dflt_date', 'between', 'next 3 month/month-period/@column', 'retainFilter' )",
  'next 6 months': "( '/dimensions/dflt_date', 'between', 'next 6 month/month-period/@column', 'retainFilter' )",
  'next 6 month': "( '/dimensions/dflt_date', 'between', 'next 6 month/month-period/@column', 'retainFilter' )",
  'next 12 months': "( '/dimensions/dflt_date', 'between', 'next 12 month/month-period/@column', 'retainFilter' )",
  'next 12 month': "( '/dimensions/dflt_date', 'between', 'next 12 month/month-period/@column', 'retainFilter' )",

  // Next X Quarters + Singular
  'next 2 quarters': "( '/dimensions/dflt_date', 'between', 'next 2 quarter/quarter-period/@column', 'retainFilter' )",
  'next 2 quarter': "( '/dimensions/dflt_date', 'between', 'next 2 quarter/quarter-period/@column', 'retainFilter' )",
  'next 4 quarters': "( '/dimensions/dflt_date', 'between', 'next 4 quarter/quarter-period/@column', 'retainFilter' )",
  'next 4 quarter': "( '/dimensions/dflt_date', 'between', 'next 4 quarter/quarter-period/@column', 'retainFilter' )",
};


export const toTitleCase = (str: string, keepUnderscore = false) => {
  if (!str) return '';
  return str.replace(/_/g, keepUnderscore ? '_' : ' ')
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const FilterMapping = (meta: Meta, columns: any[]) => {
  const op = meta?.editedContent?.operatorValue;
  const processedID = meta.processedID || `${meta.table}.${meta.id}`;

  if (!columns.flat().includes(`'${processedID}'`) && ['dimensions', 'metrics', 'flag', 'date'].includes(meta.category))
    columns.push([`'${processedID}'`]);
  if (meta.category === 'date') {
    if (op === 'between' && meta.editedContent.dateValues?.length) {
      // To Support Custom Date as filter in Semantics.
      const betweenArr: any[] = [];
      meta.editedContent.dateValues.forEach((item) => {
        // Only valid date dateFilter will be pushed into the semantics...
        if (item.dateValueFrom && item.dateValueTo) {
          betweenArr.push(
            date_mapping[op]
              ?.replace?.(/@column/g, processedID)
              .replace?.(/@period/g, item.dateValueFrom?.format('YYYY-MM-DD') + ':' + item.dateValueTo?.format('YYYY-MM-DD'))
          );
        }
      });
      return betweenArr;
    } else if (meta?.editedContent?.inputValue !== 'all') {
      if (meta?.editedContent?.inputValue.includes(':')) {
        const [startDate, endDate] = meta?.editedContent?.inputValue.split(':');

        const parsedStartDate = moment(startDate, 'MM/DD/YYYY');
        const processedStartDate = parsedStartDate.format('YYYY-MM-DD');

        const parsedEndDate = moment(endDate, 'MM/DD/YYYY');
        const processedEndDate = parsedEndDate.format('YYYY-MM-DD');

        return date_mapping.between?.replace?.(/@period/g, `${processedStartDate}:${processedEndDate}`).replace?.(/@column/g, processedID) || '';
      }

      return date_mapping[meta?.editedContent?.inputValue]?.replace?.(/@column/g, processedID) || '';
    }
  } else if (meta.category === 'dimensions' && meta?.editedContent?.inputValue?.length) {
    const fArr: string[] = [];

    Array.isArray(meta.editedContent.inputValue) &&
      meta.editedContent.inputValue.forEach((item) => {
        fArr.push(
          `('${meta.type}/${meta.category}/${meta.table}.${meta.id}', '${op}', '${op.includes('like') ? '%' + item.split('@@')[0] + '%' : item.split('@@')[0]
          }', 'retainFilter')`
        );
      });
    return fArr;
  } else if (meta.category === 'metrics' && meta.editedContent.inputValueNumber) {
    return `('${meta.type}/metrics/${meta.table}.${meta.id}', '${op}', ${Number(meta.editedContent.inputValueNumber)}, ${op === 'between' ? Number(meta.editedContent.inputValueNumberTo) + ',' : ''
      } 'retainFilter')`;
  } else if (meta.category === 'flag' && meta.editedContent.inputValue) {
    return `('/flag/${meta.table}.${meta.id}', '${op}', '${meta.editedContent.inputValue}', 'retainFilter')`;
  }
};

export const constructRetainFilter = (item: any[]) => {
  const retainFilter: any = [];
  item?.forEach((item) => {
    if (item.category === 'dateFilter') {
      if (item?.editedContent?.operatorValue === 'between') {
        item?.editedContent?.dateValues?.forEach((dateItem: any) => {
          retainFilter.push({
            category: 'dateFilter',
            col_id: 'dflt_date',
            col_name: 'dflt_date',
            dateValueFrom: dateItem?.dateValueFrom ? dateItem?.dateValueFrom?.format('MM/DD/YYYY') : '',
            dateValueTo: dateItem?.dateValueTo ? dateItem?.dateValueTo?.format('MM/DD/YYYY') : '',
            operator: item?.editedContent?.operatorValue || 'is',
            processedValue: item?.editedContent?.inputValue,
            value: item?.editedContent?.inputValue,
          });
        });
      } else {
        retainFilter.push({
          category: 'dateFilter',
          col_id: 'dflt_date',
          col_name: 'dflt_date',
          dateValueFrom: '',
          dateValueTo: '',
          operator: 'is',
          processedValue: item?.editedContent?.inputValue,
          value: item?.editedContent?.inputValue,
        });
      }
    }

    // dimensions
    if (item.category === 'dimensions' && Array.isArray(item?.editedContent?.inputValue) && item?.editedContent?.inputValue?.length) {
      const constructMessage = item?.editedContent?.inputValue.map((valueItem: any) =>
        valueItem.includes('@') ? (valueItem.split('@@')[1]?.trim() === '@@' ? '' : valueItem.split('@@')[1]) : valueItem
      );
      constructMessage.forEach((value: any) => {
        retainFilter.push({
          category: item.category,
          col_id: item.processedID,
          col_name: item.vocabulary[0],
          operator: item?.editedContent?.operatorValue,
          processedValue: value,
          value: value,
        });
      });
    }

    // flag
    if (item.category === 'flag' && item?.editedContent?.inputValue) {
      retainFilter.push({
        category: item.category,
        col_id: item.processedID,
        col_name: item.vocabulary[0],
        operator: item?.editedContent?.operatorValue,
        processedValue: item?.editedContent?.inputValue,
        value: item?.editedContent?.inputValue,
      });
    }

    // date
    if (item.category === 'date' && (item?.editedContent?.dateValue || item?.editedContent?.inputValue)) {
      if (item?.editedContent?.inputValue === 'between') {
        item?.editedContent?.dateValues?.forEach((dateItem: any) => {
          retainFilter.push({
            category: item.category,
            col_id: item.processedID,
            col_name: item.vocabulary[0],
            value: dateItem?.dateValueFrom ? dateItem?.dateValueFrom?.format('MM/DD/YYYY') : '',
            value_2: dateItem?.dateValueTo ? dateItem?.dateValueTo?.format('MM/DD/YYYY') : '',
            operator: item?.editedContent?.operatorValue,
          });
        });
      } else {
        retainFilter.push({
          category: item.category,
          col_id: item.processedID,
          col_name: item.vocabulary[0],
          operator: item?.editedContent?.operatorValue,
          processedValue: item?.editedContent?.inputValue || '',
          value: item?.editedContent?.inputValue || '',
        });
      }
    }

    // metrics
    if ((item.category === 'metrics' || item.category === 'calculated metric') && item?.editedContent?.inputValueNumber) {
      retainFilter.push({
        category: 'metrics',
        col_id: item.processedID,
        col_name: item.vocabulary[0],
        operator: item?.editedContent?.operatorValue,
        value: item?.editedContent?.inputValueNumber || '',
        value_2: item?.editedContent?.inputValueNumberTo || '',
      });
    }
  });

  return retainFilter;
};

export const GenerateSemantics = (items: any[], filters: any, metadata: { column_data: any }, questionType?: any, configuration?: any) => {
  try {
    // Initialize variables to hold processed results
    const select: (string | string[])[] = [];
    const groupby: (string | string[])[] = [];
    const columns: any[] = [];
    const semantic_filter: any[][] = [];
    const column_metadata: List<any> | null | undefined = [];
    const meta = {};

    let column_name = '';
    let date_column = '';
    let qType = '';
    let periodGroupBy = '';
    let type = `None`;

    const findDateCol = find([...items, ...filters], { category: 'date' });
    if (findDateCol) {
      qType = findDateCol.additional_data?.enable_financial_year ? 'fiscalYear' : 'calYear';
      date_column = `${findDateCol.table ? findDateCol.table + '.' : ''}${findDateCol.id}`;
    }

    const periodFilters = filter(filters, function (element) {
      return element.category === 'date' && element.editedContent?.inputValue !== 'all';
    });

    const metricCount = filter(items, { category: 'metrics' }).length;

    const getMetatData = (params: { cols: any[]; metadata: { column_data: any }; addToSelectField: boolean; table?: string; category?: string }) => {
      if (!params.cols || !params.metadata || !params.metadata.column_data) return;
      params.cols.forEach((column) => {
        const tc = column.split('.');
        const meta =
          params.category !== 'Smart Query' && params.category !== 'Smart Analytics'
            ? cloneDeep(find(metadata.column_data, { table: tc[0], id: tc[1] }))
            : cloneDeep(find(metadata.column_data, { table: params.table, id: column }));
        if (meta) {
          meta.alias = meta?.id;
          meta.processedID = `${meta.table ? meta.table + '.' + meta?.id : meta?.id}`;
          if (meta.category === 'date') {
            date_column = `${meta.table ? meta.table + '.' : ''}${meta.id}`;
            qType = meta.additional_data?.enable_financial_year ? 'fiscalYear' : 'calYear';
          }
          selectFn(meta, meta.category === 'date', params.addToSelectField);
        }
      });
    };

    const selectFn = (item: SelectFnItem, ignoreDateGrouping?: boolean, ignoreSelectField?: boolean) => {
      if (!item) return;
      const basePath = `/${item.category}/${item.table}.${item.id}`;
      const processedID = item.processedID || `${item.table}.${item.id}`;

      const metaData: MetaData = constructMetadata(item);
      column_metadata.push(metaData);

      if (item.category !== 'Smart Analytics' && item.category !== 'Smart Query') {
        if (!columns.flat().includes(`'${processedID}'`)) columns.push([`'${processedID}'`]);
      }

      if (ignoreSelectField === false) {
        return;
      }

      if (item.category === 'metrics') {
        if (questionType === 'compare') {
          for (let value of configuration.values) {
            let alias = value;

            if (value.includes(':') && value.split(':').length === 2) {
              const [startDate, endDate] = value.split(':');

              const parsedStartDate = moment(startDate, 'MM/DD/YYYY');
              const processedStartDate = parsedStartDate.format('YYYY-MM-DD');

              const parsedEndDate = moment(endDate, 'MM/DD/YYYY');
              const processedEndDate = parsedEndDate.format('YYYY-MM-DD');

              value = `${processedStartDate}:${processedEndDate}`;

              alias = parsedStartDate.format('DD MMM YYYY') + ' to ' + parsedEndDate.format('DD MMM YYYY');
            }

            select.push(
              `('${item.editedContent?.inputValue === 'average' ? 'avg' : 'sum'}', '${item.type}${basePath}', ('extract_period', '${single_period.includes(value) ? `(*${value}*)` : value
              }', '/date/${configuration.period_column}'), '${metricCount > 1 ? alias + ' ' + item.label : alias}')`
            );
            const clonedMetadata = cloneDeep(metaData);
            clonedMetadata.alias = metricCount > 1 ? alias + ' ' + item.label : alias;
            clonedMetadata.processedID = metricCount > 1 ? alias + ' ' + item.label : alias;
            column_metadata.push(clonedMetadata);
          }
        } else {
          select.push([`('${item.editedContent?.inputValue === 'average' ? 'avg' : 'sum'}'`, `'${item.type}${basePath}')`]);
        }
      } else if (item.category === 'date') {
        if (!ignoreDateGrouping) {
          if (item.editedContent?.inputValue && item.editedContent?.inputValue !== 'all') {
            select.push([`('extract', '${item.editedContent?.inputValue}', '${basePath}')`]);
            if (periodFilters && date_mapping[periodFilters[0]?.editedContent?.inputValue]) {
              select.push([`('duration', '@(startDate)', '@(endDate)')`]);
            }
            groupby.push([`('extract', '${item.editedContent?.inputValue}', '${basePath}')`]);
            periodGroupBy = `True`;
            if (configuration && !configuration?.period) {
              configuration.period = 'year-' + item.editedContent?.inputValue;
            }
          } else if (questionType !== 'pop' && questionType !== 'compare') {
            select.push([`'${item.type}${basePath}'`]);
          }
        } else if (questionType !== 'pop' && questionType !== 'compare') {
          select.push([`'${item.type}${basePath}'`]);
        }
      } else if (item.category === 'Smart Analytics' || item.category === 'Smart Query') {
        type = 'detail';
        getMetatData({
          cols: item.additional_data.updatedAliasColumns,
          metadata,
          addToSelectField: true,
          table: item.processedID,
          category: item.category,
        });
      } else if (item.category === 'calculated dimension' || item.category === 'calculated date') {
        getMetatData({
          cols: item.additional_data.columns,
          metadata,
          addToSelectField: false,
          category: item.category,
          table: item.processedID,
        });
        const basePath = `/${item.category === 'calculated dimension' ? 'dimensions' : 'date'}/{"columns":["${item.additional_data.columns.join(
          '", "'
        )}"],"formula":"(\\'text\\',\\'${Base64.encode(item.additional_data.formula)}\\',\\'${processedID}\\')"}`;
        select.push([`'${basePath}'`]);
      } else if (item.category === 'Smart Column') {
        column_name = item.id;
        type = 'detail';
        getMetatData({
          cols: item?.additional_data?.select,
          metadata,
          addToSelectField: true,
          category: item.category,
        });
        item?.additional_data?.filter?.forEach?.((fItem: { category: string; col_id: string; operator: any; value: any; }) => {
          semantic_filter.push([
            `('/${fItem.category}/${fItem.col_id}', '${fItem.operator}', ${fItem.category === 'metrics' ? Number(fItem.value) : `'${String(fItem.value)}'`
            }, None, 'ui')`,
          ]);

          const tc = fItem?.col_id.split('.');

          const filter_metadata =
            fItem.category !== 'calculatedField' && tc.length > 0
              ? cloneDeep(find(metadata.column_data, { table: tc[0], id: tc[1] }))
              : cloneDeep(find(metadata.column_data, { table: '', id: fItem.col_id }));

          if (filter_metadata) {
            filter_metadata.alias = filter_metadata?.id;
            filter_metadata.processedID = `${filter_metadata.table ? filter_metadata.table + '.' + filter_metadata?.id : filter_metadata?.id}`;

            const metaData: MetaData = constructMetadata(filter_metadata);
            column_metadata.push(metaData);
          }
        });
      } else if (item.category === 'calculated metric') {
        const tem_meta = {};
        getMetatData({
          cols: item.additional_data.columns,
          metadata,
          addToSelectField: false,
          category: item.category,
          table: item.processedID,
        });

        const groupMeta = groupBy(column_metadata, 'processedID');
        Object.keys(groupMeta).forEach((key) => {
          tem_meta[key] = groupMeta[key][0];
        });

        // Safe access to global functions in React Native environment
        const evaluateCalculatedField = global.evaluateCalculatedField || (typeof global !== 'undefined' && (global as any).evaluateCalculatedField);
        
        let query;
        if (evaluateCalculatedField) {
          query = evaluateCalculatedField(JSON.stringify(item), JSON.stringify(tem_meta));
        } else {
          console.error('evaluateCalculatedField function not available');
          query = `'${item.type}/${item.category}/${item.table}.${item.id}'`;
        }

        if (questionType === 'compare') {
          for (const value of configuration.values) {
            select.push(
              `('${item.editedContent?.inputValue === 'average' ? 'avg' : 'sum'}', "${query}", ('extract_period', '${value}', '/date/${configuration.period_column
              }'), '${metricCount > 1 ? value + ' ' + item.label : value}')`
            );

            const clonedMetadata = cloneDeep(metaData);
            clonedMetadata.alias = metricCount > 1 ? value + ' ' + item.label : value;
            clonedMetadata.processedID = metricCount > 1 ? value + ' ' + item.label : value;
            column_metadata.push(clonedMetadata);
          }
        } else {
          if (item.editedContent?.inputValue) {
            select.push([`('${item.editedContent?.inputValue === 'average' ? 'avg' : 'sum'}'`, `"${query}")`]);
          } else {
            select.push([`('sum'`, `"${query}")`]);
          }
        }
      } else if (item.category === 'dimensions' && !Array.isArray(item.editedContent?.inputValue) && item.editedContent?.inputValue) {
        // Dimensions with count ...
        select.push([`('${item.editedContent?.inputValue}', '${item.type}${basePath}')`]);
      } else {
        // dimensions || flags
        select.push([`'${item.type}${basePath}'`]);
      }
    };

    // Process items to construct 'select' and 'columns'
    items?.forEach((item) => {
      if (
        metadata &&
        (item.category === 'metrics' || item.category === 'dimensions' || item.category === 'flag' || item.category === 'date') &&
        !item.table &&
        item.processedID
      ) {
        const tc = item.processedID.split('.');
        item = find(metadata.column_data, { table: tc[0], id: tc[1] });
      }
      if (item) {
        selectFn(item, periodGroupBy === 'True');
      }
    });

    // Process dateFilter to construct 'filter' and 'dateColumn'
    filters?.forEach((item: Meta) => {
      if (
        metadata &&
        (item.category === 'metrics' || item.category === 'dimensions' || item.category === 'flag' || item.category === 'date') &&
        !item.table &&
        item.processedID
      ) {
        const tc = item.processedID.split('.');
        item = find(metadata.column_data, { table: tc[0], id: tc[1] });
      }
      if (item) {
        const semanticsFilter = FilterMapping(item, columns);
        if (semanticsFilter) {
          semantic_filter.push([semanticsFilter]);

          const metaData: MetaData = constructMetadata(item);
          column_metadata.push(metaData);
        }
      }
    });

    let output = `{ ${column_name ? `'column_name': '${column_name}',` : ''} 'select': [${select.join(', ')}], ${groupby.length ? `'groupby': [${groupby.join(', ')}],` : ''
      } 'domain': 'Metric', 'filter': [${semantic_filter.join(', ')}], 'columns': [${columns.join(', ')}], ${periodGroupBy ? `'periodGroupBy': ${periodGroupBy},` : ''
      } ${date_column ? `'dateColumn': '${date_column}',` : ''} ${qType ? `'questionType': '${qType}',` : ''} 'type': ${type === 'detail' ? "'detail'" : type
      }, 'metricCount': ${metricCount} }`;

    if (questionType === 'trending') {
      output = `{ ${column_name ? `'column_name': '${column_name}',` : ''} 'select': [${select.join(', ')}], ${groupby.length ? `'groupby': [${groupby.join(', ')}],` : ''
        } 'domain': 'Metric', 'filter': [${semantic_filter.join(', ')}], 'columns': [${columns.join(', ')}], 'periodGroupBy': True, ${date_column ? `'dateColumn': '${date_column}',` : ''
        } ${qType ? `'questionType': '${qType}',` : ''} 'type': 'trending', 'metricCount': ${metricCount},'trending': {'type': '${configuration?.type ? configuration?.type : 'up'
        }', 'limit': ${configuration?.limit ? configuration?.limit : 10}, 'columns': [${columns.join(', ')}], 'period': '${configuration?.period ? configuration?.period : 'year-month'
        }' }, 'limit': ${configuration?.limit ? configuration?.limit : 10}, 'orderby': '${configuration?.type === 'up' ? 'desc' : 'asc'
        }', 'superlative': True }`;
    } else if (questionType === 'top-bottom') {
      output = `{ ${column_name ? `'column_name': '${column_name}',` : ''} 'select': [${select.join(', ')}], ${groupby.length ? `'groupby': [${groupby.join(', ')}],` : ''
        } 'domain': 'Metric',  'filter': [${semantic_filter.join(', ')}], 'columns': [${columns.join(', ')}],  ${periodGroupBy ? `'periodGroupBy': ${periodGroupBy},` : ''
        } ${date_column ? `'dateColumn': '${date_column}',` : ''} ${qType ? `'questionType': '${qType}',` : ''} 'type': ${type === 'detail' ? "'detail'" : type
        },  'metricCount': ${metricCount}, 'limit': '${configuration?.limit}', 'orderby': '${configuration?.type === 'top' ? 'desc' : 'asc'
        }', 'superlative': True }`;
    } else if (questionType === 'compare') {
      output = `{ ${column_name ? `'column_name': '${column_name}',` : ''} 'select': [${select.join(', ')}], ${groupby.length ? `'groupby': [${groupby.join(', ')}],` : ''
        } 'domain': 'Metric',  'filter': [${semantic_filter.join(', ')}],  'columns': [${columns.join(', ')}], ${periodGroupBy ? `'periodGroupBy': ${periodGroupBy},` : ''
        }  ${date_column ? `'dateColumn': '${date_column}',` : ''}  ${qType ? `'questionType': '${qType}',` : ''} 'metricCount': ${metricCount}, ${groupby.length === 0 ? `'compareType': 'compare',` : ''
        } 'type': 'compare' }`;
    } else if (questionType === 'pop') {
      let period = '';
      let period_1 = '';
      let period_2 = '';
      let period_1_alias = '';
      let period_2_alias = '';
      let pop_latest_alias = '';
      let pop_configuration = {};

      let metric_metadata = find(items, { category: 'metrics' });
      if (!metric_metadata) {
        metric_metadata = find(items, { category: 'calculated metric' });
      }

      let metric_path = `${metric_metadata.type}/${metric_metadata.category}/${metric_metadata.table}.${metric_metadata.id}`;

      if (metric_metadata.category === 'calculated metric') {
        const dependency_meta = {};
        getMetatData({
          cols: metric_metadata.additional_data.columns,
          metadata,
          addToSelectField: false,
          category: metric_metadata.category,
          table: metric_metadata.processedID,
        });

        const groupMeta = groupBy(column_metadata, 'processedID');
        Object.keys(groupMeta).forEach((key) => {
          dependency_meta[key] = groupMeta[key][0];

          const dependency_metadata: MetaData = constructMetadata(dependency_meta[key]);
          column_metadata.push(dependency_metadata);
        });

        // Safe access to global functions in React Native environment
        const evaluateCalculatedField = global.evaluateCalculatedField || (typeof global !== 'undefined' && (global as any).evaluateCalculatedField);
        
        if (evaluateCalculatedField) {
          metric_path = evaluateCalculatedField(JSON.stringify(metric_metadata), JSON.stringify(dependency_meta)).replaceAll("'", "\\'");
        } else {
          console.error('evaluateCalculatedField function not available');
          metric_path = `'${metric_metadata.type}/${metric_metadata.category}/${metric_metadata.table}.${metric_metadata.id}'`;
        }
      }

      const aggregation = metric_metadata.editedContent?.inputValue === 'average' ? 'avg' : 'sum';

      let tag = '';

      if (configuration?.type === 'yoy') {
        tag = 'YOY';
        period = 'year';
        period_1 = '#$ytd';
        period_2 = 'last #$ytd';
        period_1_alias = '#$ytd';
        period_2_alias = 'last #$ytd';
        pop_latest_alias = 'YOY-latest';

        columns.push(`'YOY-latest'`);
      } else {
        if (configuration?.type === 'qoq') {
          tag = 'QOQ';
          period = 'quarter';
          period_1 = '#$qtd';
          period_2 = 'last #$qtd';
          period_1_alias = '#$qtd';
          period_2_alias = 'last #$qtd';
          pop_latest_alias = 'QOQ-latest';

          columns.push(`'QOQ-latest'`);
        } else if (configuration?.type === 'mom') {
          tag = 'MOM';
          period = 'month';
          period_1 = '#$mtd';
          period_2 = 'last #$mtd';
          period_1_alias = '#$mtd';
          period_2_alias = 'last #$mtd';
          pop_latest_alias = 'MOM-latest';

          columns.push(`'MOM-latest'`);
        } else if (configuration?.type === 'wow') {
          tag = 'WOW';
          period = 'week';
          period_1 = '#$wtd';
          period_2 = 'last #$wtd';
          period_1_alias = '#$wtd';
          period_2_alias = 'last #$wtd';
          pop_latest_alias = 'WOW-latest';

          columns.push(`'WOW-latest'`);
        }
      }

      pop_configuration = `{'filter_': [${periodFilters.length > 0 ? `{'column': 'isValid', 'op': '>', 'value': 0}` : ''}], 'filter': [], 'drop': [${periodFilters.length > 0 ? `'isValid'` : ''
        }], 'tag': '${tag}', 'metric': '${metric_metadata.table ? metric_metadata.table + '.' : ''}${metric_metadata.id
        }', 'type': '${tag}', 'limit': None}`;

      const group_by_template = `('extract', '${period}', '/date/${configuration?.period_column}')`;
      const select_template = `('${aggregation}', '${metric_metadata.type}/metrics/(\\'op\\', (\\'${aggregation}\\', \\"${metric_path}\\", (\\'extract_period\\', \\'${period_1}\\', \\'/date/${configuration?.period_column}\\'), \\'${period_1_alias}\\'), \\'+\\', (\\'${aggregation}\\', \\"${metric_path}\\", (\\'extract_period\\', \\'${period_2}\\', \\'/date/${configuration?.period_column}\\'), \\'${period_2_alias}\\'), \\'oz\\', \\'${pop_latest_alias}\\')')`;

      groupby.push(group_by_template);
      select.push(group_by_template);
      select.push(select_template);

      output = `{ ${column_name ? `'column_name': '${column_name}',` : ''} 'select': [${select.join(', ')}], ${groupby.length ? `'groupby': [${groupby.join(', ')}],` : ''
        } 'domain': 'Metric', 'filter': [${semantic_filter.join(', ')}], 'columns': [${columns.join(', ')}], 'periodGroupBy': True, ${date_column ? `'dateColumn': '${date_column}',` : ''
        } ${qType ? `'questionType': '${qType}',` : ''} 'type': 'pop', 'pop': ${pop_configuration}, 'metricCount': ${metricCount} }`;

      const metric_metadata_struct: MetaData = constructMetadata(metric_metadata);

      // Metadata for POP-Latest ...
      let cloned_metadata = cloneDeep(metric_metadata_struct);
      cloned_metadata.alias = pop_latest_alias;
      cloned_metadata.processedID = pop_latest_alias;
      column_metadata.push(cloned_metadata);

      // Metadata for POP ...
      cloned_metadata = cloneDeep(metric_metadata_struct);
      cloned_metadata.alias = tag;
      cloned_metadata.processedID = tag;
      column_metadata.push(cloned_metadata);

      // Metadata for Lead ...
      cloned_metadata = cloneDeep(metric_metadata_struct);
      cloned_metadata.alias = 'lead';
      cloned_metadata.processedID = 'lead';
      column_metadata.push(cloned_metadata);

      // Metadata for Lead2 ...
      cloned_metadata = cloneDeep(metric_metadata_struct);
      cloned_metadata.alias = 'lead2';
      cloned_metadata.processedID = 'lead2';
      column_metadata.push(cloned_metadata);
    }

    const groupMeta = groupBy(column_metadata, 'processedID');
    Object.keys(groupMeta).forEach((key) => {
      meta[key] = groupMeta[key][0];
    });

    return {
      output,
      meta,
    };
  } catch (e) {
    console.error('Exception while generating semantics -> ', e);
    return {};
  }
};
export const constructDisplayMessage = (items: any[]) => {
  let displayMessage: any = '';

  items.forEach((item, index) => {
    if (item?.editedContent?.inputValue === 'average') {
      displayMessage += `${item?.editedContent?.inputValue}` + ` ${item?.label}`;
    } else if (['count', 'dow', 'day', 'week', 'month', 'quarter', 'year'].indexOf(item?.editedContent?.inputValue) > -1) {
      displayMessage += ` ${item?.label}` + ` ${item?.editedContent?.inputValue}`;
    } else {
      displayMessage += ` ${item?.label}`;
    }
    displayMessage += items.length - 1 !== index ? ', ' : '';
    displayMessage = displayMessage.replace(/\b\w+\.(cd_|cdt_|sf_|cm_)(\w+)/g, '$1$2').trim();
  });

  return displayMessage;
};

export const constructUtterance = (items: any[]) => {
  let utterance: any = '';

  items.forEach((item) => {
    // Construct utterance and displayMessage
    if (item?.editedContent?.inputValue === 'average') {
      utterance += ` ${item?.editedContent?.inputValue}` + ` ${item?.processedID || item?.label}`;
    } else if (['count', 'dow', 'day', 'week', 'month', 'quarter', 'year'].indexOf(item?.editedContent?.inputValue) > -1) {
      utterance += ` ${item?.processedID || item?.label}` + ` ${item?.editedContent?.inputValue}`;
    } else {
      utterance += ` ${item?.processedID || item?.label}`;
    }
    // Clean up utterance and displayMessage
    utterance = utterance.replace(/\b\w+\.(cd_|cdt_|sf_|cm_)(\w+)/g, '$1$2').trim();
  });

  return utterance;
};

export const constructMetadata = (metadata: any) => {
  const constructed_metadata: MetaData = {
    additional_data: metadata.additional_data,
    alias: metadata.label || metadata.id,
    athena_visibility: metadata.athena_visibility,
    category: metadata.category,
    column_name: metadata.processedID,
    data_set: metadata.data_set,
    data_type: metadata.data_type,
    default_synonym: metadata.label,
    id: metadata.id,
    is_default: metadata.is_default,
    rank: metadata.rank,
    synonym: metadata.id,
    table: metadata.table,
    target_type: metadata.mapd_datatype,
    type: metadata.type,
    unit: metadata.unit,
    processedID: metadata.processedID,
  };

  return constructed_metadata;
};