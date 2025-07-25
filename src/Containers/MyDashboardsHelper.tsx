import React, { useState, useEffect, useRef } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Switch,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  ScrollView,
} from 'react-native'
import { View, Checkbox, Button } from 'react-native-ui-lib'
import dayjs, { Dayjs } from 'dayjs';
import { properCase } from '@/Utils/common';
import { reportPeriodsValues } from '@/Constants/reportPeriodsValues';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@/Hooks';
import { DateValue, Filter, FilterValue } from '@/Types/Pinboard';
import { Colors } from '@/Theme/Variables';
import { LayoutNoInternet } from '@/Components';
import { useNetInfo } from '@react-native-community/netinfo';
import { useConverseResponseMutation } from '@/Services/modules/ingress';
import CustomSelect from '@/Components/CustomSelect';
import { getLocalStore } from '@/Utils/asyncStorage';
import { name, sortBy } from 'lodash';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type DateType = string | Date | Dayjs | null | undefined;

// Utility: normalize dimensions to always be arrays
const normalizeDimensionFilters = (filters: DasboardFilter[]) => {
  return filters.map(f => {
    if (f.category === 'dimensions') {
      if (Array.isArray(f.value)) {
        return f;
      } else if (typeof f.value === 'string') {
        return {
          ...f,
          value: f.value.includes(',') ? f.value.split(',').map(v => v.trim()) : [f.value],
        };
      }
    }
    return f;
  });
};

// Utility: ensure selected values are always an array of individual strings
const ensureArrayOfStrings = (values: string[] | string): string[] => {
  if (Array.isArray(values)) {
    if (values.length === 1 && typeof values[0] === 'string' && values[0].includes(',')) {
      return values[0]
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);
    }
    return values.map(v => (typeof v === 'string' ? v.trim() : v)).filter(v => typeof v === 'string' && v.length > 0);
  } else if (typeof values === 'string') {
    return values
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);
  }
  return [];
};

interface DasboardFilter {
  type: string;
  columnId: string;
  columnName: string;
  operator: string;
  value: string | string[];
  dataSetId?: string;
  category: string;
  id?: string;
  dateFrom?: string;
  dateTo?: string;
  dateValues?: any;
  processedID: string;
  processedRequestID?: string;
  vocabulary?: string[] | null | string;
}

const dateValueMapper = (value: DateValue) =>
  `${value.dateValueFrom} - ${value.dateValueTo}`

const valueMapper = (value: FilterValue) => `${value.name}`

function buildFilterValues(value: string | FilterValue[]): string {
  return Array.isArray(value)
    ? value.length === 0
      ? 'all'
      : value.map(valueMapper).join(', ')
    : value
}
const filterMapper = (filter: Filter) => {

  let generatedFilter: DasboardFilter | null = null
  if (filter.category === 'dateFilter') {
    const { value, dateFrom, dateTo, resolvedColumn } = filter
    generatedFilter = {
      type: 'globalDateFilter',
      columnId: '',
      columnName: 'Report Period',
      operator: value !== 'between' ? 'is' : '',
      processedID: resolvedColumn,
      processedRequestID: '',
      value:
        value === 'between'
          ? `between ${dateFrom} - ${dateTo}`
          : Array.isArray(value)
            ? 'All Dates'
            : value,
      dataSetId: filter.datasetId || '',
      category: filter.category,
    }
  } else if (filter.category === 'date') {
    const { category, column, resolvedColumn, operator, dateValues, value } =
      filter
    generatedFilter = {
      type: category,
      columnId: column,
      columnName: resolvedColumn,
      operator: dateValues && dateValues.length > 0 ? 'between' : operator,
      processedID: resolvedColumn,
      value:
        dateValues && dateValues.length > 0
          ? dateValues.map(dateValueMapper).join(' AND ')
          : (value as string),
      dataSetId: filter.datasetId || '',
      category: filter.category,
    }
  } else if (filter.category === 'dimensions') {
    const { category, column, resolvedColumn, operator, value } = filter
    generatedFilter = {
      type: category,
      columnId: column,
      columnName: resolvedColumn,
      operator: operator === '' ? 'is' : operator,
      processedID: resolvedColumn,
      value: buildFilterValues(value),
      dataSetId: filter.datasetId || '',
      category: filter.category,
    }
  } else if (filter.category === 'calculated dimension') {
    const { category, column, resolvedColumn, operator, value } = filter
    generatedFilter = {
      type: category,
      columnId: column,
      columnName: resolvedColumn,
      operator: operator === '' ? 'is' : operator,
      processedID: resolvedColumn,
      value: buildFilterValues(value),
      dataSetId: filter.datasetId || '',
      category: filter.category,
    }
  } else if (filter.category === 'flag') {
    const { category, column, resolvedColumn, operator, value } = filter
    generatedFilter = {
      type: category,
      columnId: column,
      columnName: resolvedColumn,
      operator: operator === '' ? 'is' : operator,
      processedID: resolvedColumn,
      value: buildFilterValues(value),
      dataSetId: filter.datasetId || '',
      category: filter.category,
    }
  }

  return generatedFilter
}

export const buildDashboardFilters = (
  appliedFilters: Filter[],
): DasboardFilter[] => {
  const nullFilter = (filter: DasboardFilter | null) => filter !== null
  return appliedFilters.map(filterMapper).filter(nullFilter) as DasboardFilter[]
}

type DashboardFiltersProps = {
  filters: DasboardFilter[]
  toggleFilterModal: any
  data: any[]
  onFilterChange: (filters: any) => void
}

type ColumnItem = {
  category: string
  columnName: string
  columnId: string
  type: string
  dataSetId?: string
  dateFrom?: string
  dateTo?: string
  vocabulary?: string
  processedID?: string
}

export interface DimensionFilter {
  category: string
  dataSetId: string
  dateValueFrom: string
  dateValues: any
  dateValueTo: string
  globalFilter: GlobalFilter
  id: string
  isDefault: boolean
  isDisable: boolean
  isSingleValue: boolean
  operator: string
  processedID: string
  processedRequestID: string
  value: Value[] | string[]
  vocabulary: string[]
}

export interface GlobalFilter {
  enabled: boolean
  name: string
}

export interface Value {
  id: string
  name: string
}

export const DashboardFilters = ({
  filters,
  toggleFilterModal,
  data,
  onFilterChange,
}: DashboardFiltersProps) => {
  // Normalize dimension filter values to always be arrays
  const normalizedFilters = filters.map(f => {
    if (f.category === 'dimensions') {
      if (Array.isArray(f.value)) {
        return f;
      } else if (typeof f.value === 'string') {
        // If the string contains commas, split, else treat as single value array
        return {
          ...f,
          value: f.value.includes(',') ? f.value.split(',').map(v => v.trim()) : [f.value],
        };
      }
    }
    return f;
  });

  const { Fonts } = useTheme()
  const [uniqueValues, setUniqueValues] = useState<string[]>([])
  const [selectedColumn, setSelectedColumn] = useState<ColumnItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [converseResponse] = useConverseResponseMutation()
  const [modalVisible, setModalVisible] = useState(false)
  const [operatorValue, setOperatorValue] = useState('')
  const [multiSelect, setMultiSelect] = useState(true)
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [pendingSelectedValues, setPendingSelectedValues] = useState<string[] | null>(null);
  const [operators, setOperators] = useState<any>({})
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedDateRange, setSelectedDateRange] = useState<{ startDate: string | undefined, endDate: string | undefined }>({
    startDate: selectedColumn?.dateFrom ? String(selectedColumn.dateFrom) : undefined,
    endDate: selectedColumn?.dateTo ? String(selectedColumn.dateTo) : undefined
  })
  const [showPeriodPicker, setShowPeriodPicker] = useState<false | 'start' | 'end'>(false)
  const [topMenuFilters, setTopMenuFilters] = useState<DasboardFilter[]>(normalizedFilters)
  const [textInputValue, setTextInputValue] = useState('')
  const inputValueRef = useRef<string | null>(null);
  // Add state for native picker
  const [nativePicker, setNativePicker] = useState<false | 'start' | 'end'>(false);
  const [tempDate, setTempDate] = useState<Date | undefined>(undefined);

  console.log('selected column is ', selectedColumn)

  useEffect(() => {
    setLoading(true)
    const loadConfig = async () => {
      const configData = (await getLocalStore('conversight.dataset.config')) || {}
      console.log('config data is ', configData)
      setOperators(configData?.operators)
      setLoading(false)
    }
    loadConfig()
  }, [])

  // Synchronize selectedValues with pendingSelectedValues (no filtering)
  useEffect(() => {
    if (pendingSelectedValues) {
      setSelectedValues(pendingSelectedValues);
      setPendingSelectedValues(null);
    }
  }, [pendingSelectedValues]);

  // Set initial operator when selectedColumn changes
  useEffect(() => {
    if (selectedColumn && !operatorValue) {
      let newOperator = '';
      const category = selectedColumn.category;

      if (category === 'date' || category === 'dateFilter') {
        // For date, check if multi-select is enabled and more than one value is selected
        if (selectedValues.length > 1 && multiSelect) {
          newOperator = 'between';
        } else {
          // Default to 'is' or the first date operator from config if available
          newOperator = operators?.date?.[0]?.id || 'is';
        }
      } else if (category === 'flag') {
        // Default to '=' or the first flag operator from config if available
        newOperator = operators?.flag?.[0]?.id || '=';
      } else if (['dimensions', 'Smart Column', 'calculated dimension'].includes(category)) {
        // Default to the first dimensions operator from config if available
        newOperator = operators?.dimensions?.[0]?.id || 'is';
      } else if (['metrics', 'calculated metric'].includes(category)) {
        // Default to the first metrics operator from config if available
        newOperator = operators?.metrics?.[0]?.id || 'is';
      } else if (category === 'dateFilter') {
        // Default for dateFilter, assuming 'is' or first dateFilter operator
        newOperator = operators?.dateFilter?.[0]?.id || 'is';
      } else if (category === 'by_period') {
        // Default for by_period, assuming 'is' or first by_period operator
        newOperator = operators?.by_period?.[0]?.id || 'is';
      }

      // Only set the operator if we don't have one already
      if (newOperator && !operatorValue) {
        setOperatorValue(newOperator);
      }
    } else if (!selectedColumn) {
      // If no column is selected, reset operatorValue
      setOperatorValue('');
    }
  }, [selectedColumn]); // Only depend on selectedColumn

  useEffect(() => {
    if (!multiSelect && selectedValues.length > 1) {
      setSelectedValues([selectedValues[0]]);
    }
  }, [multiSelect, selectedValues]);

  useEffect(() => {
    if (textInputValue && textInputValue !== selectedValues[0]) {
      inputValueRef.current = textInputValue;
      setSelectedValues([textInputValue]);
    }
  }, [textInputValue]);

  // API fetch for unique values
  const fetchUniqueValues = async (columnName: string) => {
    setLoading(true)
    try {
      const filterObj = filters.find(f => f.columnName === columnName)
      if (!filterObj) throw new Error('Column not found in filters')
      const requestPayload: any = {
        session: {
          message: {
            text: filterObj.columnName,
            displayUtterance: '',
            domain: '',
            dataSet: filterObj.dataSetId || '',
            filter: [],
            qtype: 'addfilter',
            context: '',
          },
          options: {
            transform: true,
            freeForm: false,
            mode: '',
            channel: 'chat',
            source: 'mobile',
            record: false,
            timezone: new Date().getTimezoneOffset().toString(),
            responseType: 'instruction',
          },
        },
      }

      const response: any = await converseResponse(requestPayload).unwrap()
      if (response && response.data && response.data.length > 0) {
        const firstItem = response.data[0]
        delete firstItem.__id
        const ojbKey = Object.keys(firstItem)[0]
        const ojbKey2 = Object.keys(firstItem)[1]
        const values = response.data
          .map((item: any) => item[ojbKey2] || item[ojbKey])
          .filter((value: any) => value !== null && value !== undefined && value !== '')
        setUniqueValues(values)
      } else {
        setUniqueValues([])
      }
    } catch (err) {
      setUniqueValues([])
    } finally {
      setLoading(false)
    }
  }

  const isApplyDisabled = () => {
    if (selectedColumn?.category === 'dateFilter' || selectedColumn?.category === 'date') {
      if (dateFilter === 'between') {
        return !(selectedDateRange.startDate && selectedDateRange.endDate);
      }
      return dateFilter === 'all';
    }
    if (
      selectedColumn?.category === 'dimensions' ||
      selectedColumn?.category === 'calculated dimension' ||
      selectedColumn?.category === 'flag'
    ) {
      return !selectedValues || selectedValues.length === 0;
    }
    return false;
  };

  const handleFilterValueClick = (columnItem: ColumnItem) => {
    console.log('column item is ', columnItem)
    setUniqueValues([])
    setSelectedColumn(columnItem);

    const existingFilter = topMenuFilters.find(
      f => f.columnId === columnItem.columnId
    );

    if (existingFilter) {
      let op = existingFilter.operator || '';
      if (columnItem.category === 'flag') {
        if (op === 'equal to') op = '=';
        if (op === 'not equal to') op = '!=';
      }
      setOperatorValue(op);
      // Always normalize to array for dimensions and multi-select
      let normalizedValues: string[] = [];
      if (selectedColumn && selectedColumn.category === 'dimensions') {
        if (Array.isArray(existingFilter.value)) {
          normalizedValues = existingFilter.value.map((v: any) => typeof v === 'object' ? v.id || v.value || v.name : v);
        } else if (typeof existingFilter.value === 'string') {
          // If the string contains commas, split, else treat as single value
          normalizedValues = existingFilter.value.includes(',') ? existingFilter.value.split(',').map((v: string) => v.trim()) : [existingFilter.value];
        }
      } else {
        if (Array.isArray(existingFilter.value)) {
          normalizedValues = existingFilter.value.map((v: any) => typeof v === 'object' ? v.id || v.value || v.name : v);
        } else if (typeof existingFilter.value === 'string' && existingFilter.value.includes(',')) {
          normalizedValues = existingFilter.value.split(',').map(v => v.trim());
        } else if (existingFilter.value) {
          normalizedValues = [typeof existingFilter.value === 'object' ? existingFilter.value.id || existingFilter.value.value || existingFilter.value.name : existingFilter.value];
        }
      }
      // Always ensure array for multi-select
      if (multiSelect && normalizedValues.length === 1 && normalizedValues[0].includes(',')) {
        normalizedValues = normalizedValues[0].split(',').map((v: string) => v.trim());
      }
      setPendingSelectedValues(normalizedValues);
      // const textValue = normalizedValues.join(', ');
      // setTextInputValue(textValue);
      // --- Retain date range for both dateFilter and date ---
      if (columnItem.category === 'dateFilter' || columnItem.category === 'date') {
        // Try to get from dateFrom/dateTo first
        if (existingFilter.dateFrom && existingFilter.dateTo) {
          setDateFilter('between');
          setSelectedDateRange({
            startDate: existingFilter.dateFrom,
            endDate: existingFilter.dateTo,
          });
        } else if (existingFilter.value === 'between' && existingFilter.operator === 'between') {
          // Fallback: parse from value string if present
          const match = (existingFilter.value || '').match(/(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/);
          if (match) {
            setDateFilter('between');
            setSelectedDateRange({
              startDate: match[1],
              endDate: match[2],
            });
          } else {
            setDateFilter('between');
            setSelectedDateRange({ startDate: undefined, endDate: undefined });
          }
        } else if (existingFilter.value) {
          // Try to map display text back to value if needed
          let filterValue = Array.isArray(existingFilter.value)
            ? existingFilter.value[0]
            : existingFilter.value;
          const matchedPeriod = reportPeriodsValues.find(p => p.text === filterValue || p.value === filterValue);
          setDateFilter(matchedPeriod ? matchedPeriod.value : String(filterValue || 'all'));
          setSelectedDateRange({ startDate: undefined, endDate: undefined });
        } else {
          setDateFilter('all');
          setSelectedDateRange({ startDate: undefined, endDate: undefined });
        }
      } else {
        setDateFilter('all');
        setSelectedDateRange({ startDate: undefined, endDate: undefined });
      }
    } else {
      setOperatorValue('');
      setSelectedValues([]);
      setTextInputValue('');
      setDateFilter('all');
      setSelectedDateRange({ startDate: undefined, endDate: undefined });
    }

    setShowPeriodPicker(false);
    if (columnItem.category !== 'dateFilter') {
      fetchUniqueValues(columnItem.columnName);
    }
    setModalVisible(true);
  }

  const mapFiltersForParent = (filters: DasboardFilter[]) => {
    return filters.map(filter => {
      const getVocabulary = () => {
        const processedID = filter.processedID || '';
        const isCalcDim = filter.category === 'calculated dimension';
        const base: any =
          isCalcDim
            ? processedID.replace(/^cd_/, '')
            : processedID.includes('.') ? processedID.split('.').pop() : processedID;

        return [base.replaceAll('_', ' ')];
      };

      if (filter.category === 'dateFilter') {
        let dateValueFrom = '';
        let dateValueTo = '';
        let value: any = '';
        if (typeof filter.value === 'string' && filter.value.startsWith('between ')) {
          const match = filter.value.match(/between (\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/);
          if (match) {
            dateValueFrom = match[1];
            dateValueTo = match[2];
            value = 'between';
          } else {
            dateValueFrom = filter.dateFrom ? dayjs(filter.dateFrom).format('MM/DD/YYYY') : dayjs().format('MM/DD/YYYY');
            dateValueTo = filter.dateTo ? dayjs(filter.dateTo).format('MM/DD/YYYY') : dayjs().format('MM/DD/YYYY');
            value = filter.operator === 'between' ? 'between' : (typeof filter.value === 'string' ? filter.value : Array.isArray(filter.value) ? filter.value[0] : '');
          }
        } else if (filter.value === 'All Dates') {
          dateValueFrom = dayjs().format('MM/DD/YYYY');
          dateValueTo = dayjs().format('MM/DD/YYYY');
          value = [];
        } else {
          dateValueFrom = filter.dateFrom ? dayjs(filter.dateFrom).format('MM/DD/YYYY') : dayjs().format('MM/DD/YYYY');
          dateValueTo = filter.dateTo ? dayjs(filter.dateTo).format('MM/DD/YYYY') : dayjs().format('MM/DD/YYYY');
          value = filter.operator === 'between' ? 'between' : (typeof filter.value === 'string' ? filter.value : Array.isArray(filter.value) ? filter.value[0] : '');
        }
        return {
          category: filter.category,
          data_set: '',
          dateValueFrom,
          dateValues: null,
          dateValueTo,
          globalFilter: null,
          id: '',
          isDefault: true,
          isDisable: false,
          isSingleValue: false,
          operator: '',
          processedID: '',
          processedRequestID: '',
          value,
          vocabulary: null,
        };
      }
      if (filter.category === 'date') {
        const value = typeof filter.value === 'string' ? filter.value.replace("between ", "") : "";
        const [dateValueFrom, dateValueTo] = value.split(" - ");
        const dateValues = filter.operator === 'between' ? [{ dateValueFrom: dateValueFrom, dateValueTo: dateValueTo }] : [];

        return {
          category: filter.category,
          data_set: filter.dataSetId,
          dateValueFrom: '',
          dateValues: dateValues,
          dateValueTo: '',
          globalFilter: {
            enabled: false,
            name: ""
          },
          id: filter.id || filter.columnId,
          isDefault: false,
          isDisable: false,
          isSingleValue: false,
          operator: filter.operator || '',
          processedID: filter.processedID,
          processedRequestID: '',
          value: filter.value === 'All Dates' ? 'all' : (filter.operator === 'between' ? 'between' : filter.value),
          vocabulary: getVocabulary(),
        };
      }

      if (filter.category === 'calculated dimension') {
        let values: { id: string; name: string }[] = [];
        if (Array.isArray(filter.value)) {
          let arr: string[] = [];
          if (filter.value.length === 1 && typeof filter.value[0] === 'string' && filter.value[0].includes(',')) {
            arr = filter.value[0].split(',').map((v: string) => v.trim());
          } else {
            arr = filter.value as string[];
          }
          values = arr
            .filter((v: any) => v !== 'all')
            .map((v: any) => ({ id: v, name: v }));
        } else if (typeof filter.value === 'string' && filter.value === 'all') {
          values = [];
        } else if (typeof filter.value === 'string' && filter.value.includes(',')) {
          values = filter.value.split(',').map((v: string) => ({ id: v.trim(), name: v.trim() }));
        } else if (filter.value) {
          values = [{ id: filter.value, name: filter.value }];
        }
        return {
          category: filter.category,
          data_set: filter.dataSetId,
          dateValueFrom: '',
          dateValues: null,
          dateValueTo: '',
          globalFilter: { enabled: false, name: '' },
          id: filter.id || filter.columnId,
          isDefault: false,
          isDisable: false,
          isSingleValue: false,
          operator: filter.operator,
          processedID: filter.processedID,
          processedRequestID: '',
          value: values,
          vocabulary: getVocabulary(),
        };
      }

      if (filter.category === 'flag') {
        let flagValue: any = [];
        if (Array.isArray(filter.value)) {
          if (filter.value.length === 0 || (filter.value.length === 1 && filter.value[0] === 'all')) {
            flagValue = [];
          } else {
            flagValue = filter.value[0];
          }
        } else if (filter.value === 'all' || !filter.value) {
          flagValue = [];
        } else {
          flagValue = filter.value;
        }
        let newOperator = filter.operator;
        if (filter.operator === 'equal to') {
          newOperator = '=';
        } else if (filter.operator === 'not equal to') {
          newOperator = '!=';
        }
        return {
          category: filter.category,
          data_set: filter.dataSetId,
          dateValueFrom: '',
          dateValues: null,
          dateValueTo: '',
          globalFilter: { enabled: false, name: '' },
          id: filter.id || filter.columnId,
          isDefault: false,
          isDisable: false,
          isSingleValue: false,
          operator: newOperator,
          processedID: filter.processedID,
          processedRequestID: '',
          value: flagValue,
          vocabulary: getVocabulary(),
        };
      }
      if (filter.category === 'dimensions') {
        let values: { id: string; name: string }[] = [];
        if (Array.isArray(filter.value)) {
          let arr: string[] = [];
          if (filter.value.length === 1 && typeof filter.value[0] === 'string' && filter.value[0].includes(',')) {
            arr = filter.value[0].split(',').map((v: string) => v.trim());
          } else {
            arr = filter.value as string[];
          }
          values = arr
            .filter((v: any) => v !== 'all')
            .map((v: any) => ({ id: v, name: v }));
        } else if (typeof filter.value === 'string' && filter.value === 'all') {
          values = [];
        } else if (typeof filter.value === 'string' && filter.value.includes(',')) {
          values = filter.value.split(',').map((v: string) => ({ id: v.trim(), name: v.trim() }));
        }
        return {
          category: filter.category,
          data_set: filter.dataSetId,
          dateValueFrom: '',
          dateValues: null,
          dateValueTo: '',
          globalFilter: { enabled: false, name: '' },
          id: filter.id || filter.columnId,
          isDefault: false,
          isDisable: false,
          isSingleValue: false,
          operator: filter.operator,
          processedID: filter.processedID,
          processedRequestID: '',
          value: values,
          vocabulary: getVocabulary(),
        };
      }

      return null;
    }).filter(Boolean);
  };

  const handleResetFilters = () => {
    const normalized = normalizeDimensionFilters(filters);
    setTopMenuFilters(normalized);
    const retainFilters = mapFiltersForParent(normalized);
    onFilterChange(retainFilters);
    toggleFilterModal(retainFilters);
    setModalVisible(false);
  };

  const handleDone = () => {
    if (!selectedColumn) return;


    console.log('top menu filters is ', topMenuFilters)

    console.log('selected column is ', selectedColumn)


    let filterValue: string | string[] = '';
    if (multiSelect) {
      filterValue = Array.isArray(selectedValues) ? selectedValues.filter(v => v !== undefined && v !== null && v !== '') : [];
    } else if (selectedValues.length === 1) {
      filterValue = selectedValues[0];
    } else if (textInputValue) {
      filterValue = textInputValue;
    }

    if (selectedColumn.category === 'flag') {
      if (Array.isArray(selectedValues) && selectedValues.includes('all')) {
        filterValue = [];
      }
    }

    // Debug the dateFilter value
    console.log('Current dateFilter value:', dateFilter);

    // Get the selected period text
    const selectedPeriod = reportPeriodsValues.find(p => p.value === dateFilter);
    const displayValue = selectedPeriod ? selectedPeriod.text : 'All Dates';

    // Format custom date range string
    const customDateRangeString = (start: string | undefined, end: string | undefined) => {
      if (start && end) {
        return `${dayjs(start).format('MM/DD/YYYY')} - ${dayjs(end).format('MM/DD/YYYY')}`;
      }
      return '';
    };

    // Create a new filter object based on the selected column and values
    let newFilter: DasboardFilter;
    if (selectedColumn.category === 'date') {
      // Handle period or custom range for date filter
      if (dateFilter === 'between' && selectedDateRange.startDate && selectedDateRange.endDate) {
        newFilter = {
          category: selectedColumn.category,
          columnId: selectedColumn.columnId,
          columnName: selectedColumn.columnName,
          dataSetId: selectedColumn.dataSetId,
          operator: 'between',
          type: selectedColumn.type,
          value: `between ${customDateRangeString(selectedDateRange.startDate, selectedDateRange.endDate)}`,
          id: selectedColumn.columnId || Date.now().toString(),
          dateFrom: selectedDateRange.startDate,
          dateTo: selectedDateRange.endDate,
          dateValues: [{ dateValueFrom: dayjs(selectedDateRange.startDate).format('MM/DD/YYYY'), dateValueTo: dayjs(selectedDateRange.endDate).format('MM/DD/YYYY') }],
          processedID: selectedColumn.processedID || '',
          processedRequestID: '',
          vocabulary: selectedColumn.vocabulary || '',
        };
      } else if (dateFilter !== 'all') {
        // Period selected
        const selectedPeriod = reportPeriodsValues.find(p => p.value === dateFilter);
        newFilter = {
          category: selectedColumn.category,
          columnId: selectedColumn.columnId,
          columnName: selectedColumn.columnName,
          dataSetId: selectedColumn.dataSetId,
          operator: 'is',
          type: selectedColumn.type,
          value: selectedPeriod ? selectedPeriod.text : dateFilter,
          id: selectedColumn.columnId || Date.now().toString(),
          dateFrom: undefined,
          dateTo: undefined,
          dateValues: undefined,
          processedID: selectedColumn.processedID || '',
          processedRequestID: '',
          vocabulary: selectedColumn.vocabulary || '',
        };
      } else {
        // No period or range selected
        newFilter = {
          category: selectedColumn.category,
          columnId: selectedColumn.columnId,
          columnName: selectedColumn.columnName,
          dataSetId: selectedColumn.dataSetId,
          operator: 'is',
          type: selectedColumn.type,
          value: 'All Dates',
          id: selectedColumn.columnId || Date.now().toString(),
          dateFrom: undefined,
          dateTo: undefined,
          dateValues: undefined,
          processedID: selectedColumn.processedID || '',
          processedRequestID: '',
          vocabulary: selectedColumn.vocabulary || '',
        };
      }
    } else if (selectedColumn.category === 'dateFilter') {
      // For report period settings
      if (dateFilter === 'between' && selectedDateRange.startDate && selectedDateRange.endDate) {
        newFilter = {
          category: selectedColumn.category,
          columnId: selectedColumn.columnId,
          columnName: selectedColumn.columnName,
          dataSetId: selectedColumn.dataSetId,
          operator: 'between',
          type: 'globalDateFilter',
          value: `between ${customDateRangeString(selectedDateRange.startDate, selectedDateRange.endDate)}`,
          id: selectedColumn.columnId || Date.now().toString(),
          dateFrom: selectedDateRange.startDate,
          dateTo: selectedDateRange.endDate,
          dateValues: [{ dateValueFrom: dayjs(selectedDateRange.startDate).format('MM/DD/YYYY'), dateValueTo: dayjs(selectedDateRange.endDate).format('MM/DD/YYYY') }],
          processedID: selectedColumn.processedID || '',
          processedRequestID: '',
          vocabulary: selectedColumn.vocabulary || '',
        };
      } else if (dateFilter !== 'all') {
        const selectedPeriod = reportPeriodsValues.find(p => p.value === dateFilter);
        newFilter = {
          category: selectedColumn.category,
          columnId: selectedColumn.columnId,
          columnName: selectedColumn.columnName,
          dataSetId: selectedColumn.dataSetId,
          operator: 'is',
          type: 'globalDateFilter',
          value: selectedPeriod ? selectedPeriod.text : dateFilter,
          id: selectedColumn.columnId || Date.now().toString(),
          dateFrom: undefined,
          dateTo: undefined,
          dateValues: undefined,
          processedID: selectedColumn.processedID || '',
          processedRequestID: '',
          vocabulary: selectedColumn.vocabulary || '',
        };
      } else {
        newFilter = {
          category: selectedColumn.category,
          columnId: selectedColumn.columnId,
          columnName: selectedColumn.columnName,
          dataSetId: selectedColumn.dataSetId,
          operator: 'is',
          type: 'globalDateFilter',
          value: 'All Dates',
          id: selectedColumn.columnId || Date.now().toString(),
          dateFrom: undefined,
          dateTo: undefined,
          dateValues: undefined,
          processedID: selectedColumn.processedID || '',
          processedRequestID: '',
          vocabulary: selectedColumn.vocabulary || '',
        };
      }
    } else {
      // Always store value as array for dimensions
      let valueToStore = filterValue;
      if (selectedColumn.category === 'dimensions') {
        if (Array.isArray(filterValue)) {
          valueToStore = filterValue;
        } else if (typeof filterValue === 'string') {
          // If the string contains commas, split, else treat as single value array
          valueToStore = filterValue.includes(',') ? filterValue.split(',').map((v: string) => v.trim()) : [filterValue];
        } else {
          valueToStore = [];
        }
      }
      newFilter = {
        category: selectedColumn.category,
        columnId: selectedColumn.columnId,
        columnName: selectedColumn.columnName,
        dataSetId: selectedColumn.dataSetId,
        operator: operatorValue,
        type: selectedColumn.type,
        value: selectedColumn.columnName === 'Report Period' ? [displayValue] : valueToStore,
        id: selectedColumn.columnId || Date.now().toString(),
        dateFrom: selectedDateRange.startDate,
        dateTo: selectedDateRange.endDate,
        dateValues: selectedDateRange.startDate && selectedDateRange.endDate
          ? { start: selectedDateRange.startDate, end: selectedDateRange.endDate }
          : undefined,
        processedID: selectedColumn.processedID || '',
        processedRequestID: '',
        vocabulary: selectedColumn.vocabulary || '',
      };
    }


    // Create a new array with updated or added filter
    let updatedFilters = [...topMenuFilters];


    // Special handling for Report Period which might have empty columnId
    const isReportPeriod = selectedColumn.columnName === 'Report Period';

    // Find existing filter index


    const existingFilterIndex = updatedFilters.findIndex(f => {
      if (isReportPeriod) {
        return f.columnName === 'Report Period' && f.type === 'globalDateFilter';
      }
      // For calculated dimensions, check by columnId and type to be extra safe
      return f.columnId === selectedColumn.columnId && f.type === selectedColumn.type;
    });



    if (existingFilterIndex >= 0) {
      // Update existing filter
      updatedFilters[existingFilterIndex] = newFilter;
    } else if (newFilter.value) {
      // Add new filter if it has a value
      updatedFilters.push(newFilter);
    }




    // Update the state
    setTopMenuFilters(updatedFilters);

    // Prepare filters for the parent component
    const retainFilters = mapFiltersForParent(updatedFilters);

    // Update parent component and close modal
    onFilterChange(retainFilters);
    toggleFilterModal(retainFilters);
    if (operatorValue === 'like' || operatorValue === 'not like') {
      setTextInputValue('');
    }
    setModalVisible(false);

    // // Reset form
    // setSelectedValues([]);
    // setTextInputValue('');
    // setDateFilter('all');
    // setSelectedDateRange({ startDate: undefined, endDate: undefined });
    // setOperatorValue('');
    // setSelectedColumn(null);
  };

  const renderFilter = ({ item: filter }: { item: DasboardFilter }) => {
    // Format the value for display
    const formatValue = (value: any, operator: string, category: string) => {
      // Custom date range display for date/dateFilter
      if ((category === 'date' || category === 'dateFilter') && typeof value === 'string' && value.startsWith('between ')) {
        // value is like 'between MM/DD/YYYY - MM/DD/YYYY'
        return value;
      }
      if (category === 'flag') {
        if (!value || value === 'all' || (Array.isArray(value) && (value.length === 0 || (value.length === 1 && value[0] === 'all')))) {
          return 'all';
        }
        return value;
      }
      if (Array.isArray(value)) {
        return value.filter((v: string) => typeof v === 'string' && v.trim().length > 0).join(', ');
      }
      if (typeof value === 'string') {
        return value.trim().length > 0 ? value : '';
      }
      return '';
    };

    let operatorDisplay = filter.operator;
    if (filter.category === 'flag') {
      if (filter.operator === 'equal to') {
        operatorDisplay = '=';
      } else if (filter.operator === 'not equal to') {
        operatorDisplay = '!=';
      }
    }

    return (
      <TouchableOpacity
        style={styles.filterPressable}
        onPress={() => handleFilterValueClick(filter as any)}
      >
        <View
          row
          margin-2
          marginH-6
          style={styles.filterContent}
        >
          <View style={styles.icon}>
            <Icon name="checkmark-circle-outline" size={18} color={Colors.WHITE} />
          </View>
          <Text style={[Fonts.textSmall, styles.filterColumnName]} numberOfLines={1}>
            {properCase(filter.columnName)}
          </Text>
          <Text
            style={[Fonts.textSmall, styles.filterValueText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {(filter.category === 'date' || filter.category === 'dateFilter') &&
              typeof filter.value === 'string' &&
              filter.value.startsWith('between ')
              ? filter.value
              : `${operatorDisplay} ${formatValue(filter.value, operatorDisplay, filter.category)}`
            }
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  const { isConnected } = useNetInfo()
  return (
    <View>
      {!isConnected && <LayoutNoInternet><></></LayoutNoInternet>}
      <View style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
        <View
          paddingT-8
          paddingB-8
          paddingH-16
          style={{ backgroundColor: Colors.WHITE, width: '100%' }}
        >
          <View style={styles.filterContainer}>
            <View style={styles.filterListContainer}>
              <FlatList
                data={topMenuFilters}
                showsHorizontalScrollIndicator={false}
                horizontal
                keyExtractor={item => `${item.columnId}-${item.columnName}-${item.value}`}
                renderItem={renderFilter}
              />
            </View>
            {topMenuFilters.length > 0 && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetFilters}
              >
                <Icon name="refresh-outline" size={16} color={Colors.WHITE} />
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <Modal
        animationType="slide"
        presentationStyle='pageSheet'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.modalOverlay]}>
                <View style={styles.reportPeriodDropdown}>
                  <View style={styles.modalHeader}>
                    {selectedColumn?.category === 'dateFilter' ? (
                      <Text style={styles.sectionTitle}>Report Period Settings</Text>
                    ) : (
                      <Text style={styles.sectionTitle}>Filter Settings</Text>
                    )}
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Icon name="close-circle-outline" size={24} color={Colors.GREEN_DARK} />
                    </TouchableOpacity>
                  </View>
                  {selectedColumn?.category === 'dateFilter' || selectedColumn?.category === 'date' ? (
                    <View>
                      <View style={styles.section}>
                        <TouchableOpacity
                          style={[
                            styles.selectButton,
                            dateFilter === 'between' && styles.inactiveSelectButton,
                          ]}
                          onPress={() => {
                            if (dateFilter !== 'between') {
                              setShowPeriodPicker('start');
                            }
                          }}
                        >
                          <Text
                            style={[
                              styles.selectButtonText,
                              dateFilter === 'between' && styles.inactiveSelectButtonText,
                            ]}
                          >
                            {/* Show selected period or custom range, or 'All Dates' if 'all' */}
                            {(() => {
                              if (dateFilter === 'between' && selectedDateRange.startDate && selectedDateRange.endDate) {
                                return `${dayjs(selectedDateRange.startDate).format('MMM D, YYYY')} - ${dayjs(selectedDateRange.endDate).format('MMM D, YYYY')}`;
                              } else if (dateFilter === 'all') {
                                return 'All Dates';
                              } else {
                                const period = reportPeriodsValues.find(p => p.value === dateFilter);
                                return period ? period.text : 'Select period';
                              }
                            })()}
                          </Text>
                          <Icon
                            name="chevron-down"
                            size={24}
                            color={dateFilter === 'between' ? Colors.GRAY : Colors.GREEN_DARK}
                          />
                        </TouchableOpacity>
                        <Modal visible={showPeriodPicker === 'start'} transparent animationType="slide">
                          <View style={styles.modalOverlay}>
                            <View style={styles.dropdown}>
                              <Text style={styles.sectionTitle}>Select Period</Text>
                              <FlatList
                                data={reportPeriodsValues}
                                keyExtractor={item => item.value}
                                renderItem={({ item }) => (
                                  <TouchableOpacity
                                    style={styles.periodOption}
                                    onPress={() => {
                                      setDateFilter(item.value)
                                      setShowPeriodPicker(false)
                                    }}
                                  >
                                    <Text style={styles.periodOptionText}>{item.text}</Text>
                                  </TouchableOpacity>
                                )}
                              />
                              <Button
                                label="Cancel"
                                onPress={() => {
                                  // Only close the modal, do not reset or change any date value
                                  setShowPeriodPicker(false);
                                }}
                                style={{ marginTop: 20, backgroundColor: Colors.GREEN_DARK }}
                              />
                            </View>
                          </View>
                        </Modal>
                      </View>
                      <View style={styles.orSeparator}>
                        <View style={styles.orLine} />
                        <Text style={styles.orText}>OR</Text>
                        <View style={styles.orLine} />
                      </View>
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Custom Date Range</Text>
                        <View style={styles.customDateRangeContainer}>
                          <Checkbox
                            value={dateFilter === 'between'}
                            onValueChange={(value: boolean) => {
                              setDateFilter(value ? 'between' : 'all')
                              if (!value) {
                                setSelectedDateRange({ startDate: undefined, endDate: undefined })
                              }
                            }}
                            color={Colors.GREEN_MAIN}
                            style={styles.checkbox}
                          />
                          <Text style={styles.customDateRangeLabel}>
                            Enable custom date range
                          </Text>
                        </View>
                        {dateFilter === 'between' && (
                          <View>
                            {/* Selected Range Display moved up */}
                            <View style={styles.selectedDateDisplay}>
                              <Text style={styles.selectedDateLabel}>Selected Range:</Text>
                              <Text style={styles.selectedDateText}>
                                {selectedDateRange.startDate && selectedDateRange.endDate
                                  ? `${dayjs(selectedDateRange.startDate).format('MMM D, YYYY')} - ${dayjs(selectedDateRange.endDate).format('MMM D, YYYY')}`
                                  : selectedDateRange.startDate
                                    ? `${dayjs(selectedDateRange.startDate).format('MMM D, YYYY')} - Select end date`
                                    : 'Select date range'}
                              </Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                              {/* Start Date Box */}
                              <TouchableOpacity
                                style={[
                                  styles.dateBox,
                                  { marginRight: 8 },
                                  !selectedDateRange.startDate && styles.dateBoxPlaceholder,
                                ]}
                                onPress={() => {
                                  setTempDate(selectedDateRange.startDate ? new Date(selectedDateRange.startDate) : new Date());
                                  setNativePicker('start');
                                }}
                              >
                                <Text style={styles.dateBoxLabel}>Start Date</Text>
                                <Text style={styles.dateBoxValue}>
                                  {selectedDateRange.startDate
                                    ? dayjs(selectedDateRange.startDate).format('MMM D, YYYY')
                                    : 'Select'}
                                </Text>
                              </TouchableOpacity>
                              {/* End Date Box */}
                              <TouchableOpacity
                                style={[
                                  styles.dateBox,
                                  { marginLeft: 8 },
                                  !selectedDateRange.endDate && styles.dateBoxPlaceholder,
                                ]}
                                onPress={() => {
                                  setTempDate(selectedDateRange.endDate ? new Date(selectedDateRange.endDate) : new Date());
                                  setNativePicker('end');
                                }}
                                disabled={!selectedDateRange.startDate}
                              >
                                <Text style={styles.dateBoxLabel}>End Date</Text>
                                <Text style={styles.dateBoxValue}>
                                  {selectedDateRange.endDate
                                    ? dayjs(selectedDateRange.endDate).format('MMM D, YYYY')
                                    : 'Select'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                            {/* Native Spinner Date Picker (no custom modal) */}
                            {nativePicker && (
                              <DateTimePicker
                                value={tempDate || new Date()}
                                display="default"
                                minimumDate={nativePicker === 'end' && selectedDateRange.startDate ? new Date(selectedDateRange.startDate) : undefined}
                                maximumDate={nativePicker === 'start' && selectedDateRange.endDate ? new Date(selectedDateRange.endDate) : undefined}
                                onChange={(event: DateTimePickerEvent, date?: Date) => {
                                  const pickerType = nativePicker; // Save current value
                                  setNativePicker(false);
                                  if (event.type === 'dismissed') return;
                                  if (!date) return;
                                  setTempDate(date); // Always update tempDate for UI feedback
                                  if (event.type === 'set') {
                                    const picked = dayjs(date).startOf('day');
                                    if (pickerType === 'start') {
                                      // Prevent same date as end
                                      if (selectedDateRange.endDate && picked.isSame(dayjs(selectedDateRange.endDate), 'day')) return;
                                      setSelectedDateRange(range => ({
                                        ...range,
                                        startDate: picked.toISOString(),
                                        // If endDate is before new startDate, reset endDate
                                        endDate: range.endDate && picked.isAfter(dayjs(range.endDate)) ? undefined : range.endDate,
                                      }));
                                    } else {
                                      // Prevent same date as start
                                      if (selectedDateRange.startDate && picked.isSame(dayjs(selectedDateRange.startDate), 'day')) return;
                                      setSelectedDateRange(range => ({
                                        ...range,
                                        endDate: picked.toISOString(),
                                      }));
                                    }
                                  }
                                }}
                              />
                            )}
                          </View>
                        )}
                      </View>
                    </View>

                  ) : (
                    <View>
                      <View style={styles.operatorContainer}>
                        <Text style={styles.operatorLabel}>Operator</Text>
                        <View style={styles.operatorOptions}>
                          {selectedColumn?.category && operators?.[selectedColumn.category]?.map((option: any) => {
                            const isSelected =
                              operatorValue === option.id ||
                              (operatorValue === '=' && (option.id === 'equal to' || option.id === '=')) ||
                              (operatorValue === '!=' && (option.id === 'not equal to' || option.id === '!='));
                            return (
                              <TouchableOpacity
                                key={option.id}
                                style={[
                                  styles.operatorOption,
                                  isSelected && styles.selectedOperator,
                                ]}
                                onPress={() => {
                                  let op = option.id;
                                  if (selectedColumn?.category === 'flag') {
                                    if (op === 'equal to') op = '=';
                                    if (op === 'not equal to') op = '!=';
                                  }
                                  setOperatorValue(op);
                                }}
                              >
                                <Text
                                  style={[
                                    styles.operatorText,
                                    isSelected && styles.selectedOperatorText,
                                  ]}
                                >
                                  {option.name || option.id}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                      {!['like', 'not like'].includes(operatorValue) ? (
                        <>
                          {selectedColumn?.category !== 'flag' && (
                            <TouchableOpacity
                              style={styles.toggleRow}
                              onPress={() => setMultiSelect(!multiSelect)}
                            >
                              <Text style={styles.sectionTitle}>Enable Multi-Select</Text>
                              <Switch
                                value={multiSelect}
                                onValueChange={setMultiSelect}
                                trackColor={{
                                  false: Colors.GRAY_LIGHT,
                                  true: Colors.GREEN_MAIN,
                                }}
                                thumbColor={Colors.GREEN_LIGHTEST}
                                style={styles.toggleSwitch}
                              />
                            </TouchableOpacity>
                          )}
                          <CustomSelect
                            mode={selectedColumn?.category === 'flag' ? 'SINGLE' : (multiSelect ? 'MULTI' : 'SINGLE')}
                            options={
                              loading
                                ? []
                                : (() => {
                                    let baseOptions = Array.from(new Set([
                                      ...ensureArrayOfStrings(selectedValues),
                                      ...uniqueValues,
                                    ]));
                                    if (selectedColumn?.category === 'flag') {
                                      if (!baseOptions.includes('all')) baseOptions.unshift('all');
                                    } else {
                                      if (multiSelect) {
                                        if (!baseOptions.includes('all')) baseOptions.unshift('all');
                                      } else {
                                        baseOptions = baseOptions.filter(v => v !== 'all');
                                      }
                                    }
                                    return baseOptions.map(v => ({ label: v, value: v }));
                                  })()
                            }
                            value={ensureArrayOfStrings(selectedValues)}
                            onChange={(vals) => {
                              if (selectedColumn?.category === 'flag') {
                                setSelectedValues(vals);
                              } else if (multiSelect) {
                                if (vals.includes('all')) {
                                  setSelectedValues(['all']);
                                } else {
                                  setSelectedValues(vals.filter(v => v !== 'all'));
                                }
                              } else {
                                setSelectedValues(vals);
                              }
                            }}
                            disabledOptions={multiSelect ? (() => {
                              const selected = ensureArrayOfStrings(selectedValues);
                              if (selectedColumn?.category !== 'flag') {
                                if (selected.includes('all')) {
                                  return ((options) => options.filter(v => v !== 'all'))(Array.from(new Set([
                                    ...ensureArrayOfStrings(selectedValues),
                                    ...uniqueValues,
                                  ])));
                                } else if (selected.length > 0) {
                                  return ['all'];
                                }
                              }
                              return [];
                            })() : []}
                            placeholder="Select value(s)"
                            loading={loading}
                            showSearch={selectedColumn?.category !== 'flag'}
                          />
                        </>
                      ) : (
                        <View style={styles.textInputContainer}>
                          <TextInput
                            style={styles.textInput}
                            value={textInputValue}
                            onChangeText={setTextInputValue}
                            placeholder="Enter the value"
                            placeholderTextColor={Colors.GRAY_DARK}
                          />
                          {textInputValue ? (
                            <TouchableOpacity
                              style={styles.clearButton}
                              onPress={() => setTextInputValue('')}
                            >
                              <Icon name="close-circle" size={20} color={Colors.TEXT_BLACK} />
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      )}
                    </View>
                  )}
                  <View style={dateFilter === 'all' ? { marginBottom: '6.5%' } : { marginTop: '20%' }}>
                    <Button
                      label="Apply"
                      onPress={handleDone}
                      style={{
                        backgroundColor: Colors.GREEN_DARK,
                        marginTop: 20,
                        opacity: isApplyDisabled() ? 0.5 : 1
                      }}
                      disabled={isApplyDisabled()}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  icon: {
    marginHorizontal: 6,
    backgroundColor: Colors.GREEN_MAIN,
    borderRadius: 25,
  },
  filterButton: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.GREEN_DARK,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000'
  },
  filterButtonText: {
    color: Colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  filterIcon: {
    marginLeft: 4,
  },
  filter: {
    alignItems: 'center',
    paddingRight: 10,
    paddingVertical: 6,
    borderRadius: 16,

    /* For box shadow */
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,

    elevation: 2,
  },
  filterPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  filterColumnName: {
    fontSize: 14,
    marginRight: 4,
  },
  filterValueText: {
    fontSize: 14,
    color: Colors.GREEN_MAIN,
  },
  font14: {
    fontSize: 14,
  },
  filterValue: {
    marginLeft: 4,
    color: Colors.GREEN_MAIN,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  reportPeriodDropdown: {
    backgroundColor: Colors.WHITE,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  dropdown: {
    backgroundColor: Colors.WHITE,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%'
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.GREEN_MAIN,
  },
  operatorContainer: {
    marginBottom: 16,
  },
  operatorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.GREEN_DARK
  },
  operatorOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operatorOption: {
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.GREEN_MAIN,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedOperator: {
    backgroundColor: Colors.GREEN_MAIN,
  },
  operatorText: {
    fontSize: 14,
    color: Colors.TEXT_BLACK,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.GREY,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    height: 48,
    color: Colors.TEXT_BLACK,
  },
  clearButton: {
    padding: 8,
    color: Colors.TEXT_BLACK,
  },
  selectedOperatorText: {
    fontWeight: '600',
    color: Colors.WHITE,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  toggleSwitch: {
    marginBottom: 10,
    transform: [{ scaleX: Platform.OS === 'android' ? 1.2 : 0.8 }, { scaleY: Platform.OS === 'android' ? 1.2 : 0.8 }],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.GREEN_DARK,
    marginBottom: 15,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.GREEN_DARK,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  inactiveSelectButton: {
    borderColor: Colors.GRAY,
  },
  selectButtonText: {
    fontSize: 16,
    color: Colors.GREEN_DARK,
  },
  inactiveSelectButtonText: {
    color: Colors.GRAY,
  },
  orSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.GREEN_DARK,
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 16,
    color: Colors.GREEN_MAIN,
  },
  customDateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    marginRight: 10,
  },
  customDateRangeLabel: {
    fontSize: 16,
    color: Colors.DARK_TEXT,
  },
  periodOption: {
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY,
  },
  periodOptionText: {
    fontSize: 16,
    color: Colors.DARK_TEXT,
  },
  section: {
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedDateDisplay: {
    backgroundColor: `${Colors.GREEN_DARK}10`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: Colors.GREEN_DARK,
  },
  selectedDateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.GREEN_DARK,
    marginBottom: 4,
  },
  selectedDateText: {
    fontSize: 16,
    color: Colors.DARK_TEXT,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  filterListContainer: {
    flex: 1,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.GREEN_DARK,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  resetButtonText: {
    color: Colors.WHITE,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  dateBox: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.GREEN_DARK,
    borderRadius: 8,
    padding: 12,
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 56,
  },
  dateBoxPlaceholder: {
    borderColor: Colors.GRAY,
  },
  dateBoxLabel: {
    fontSize: 12,
    color: Colors.GREEN_DARK,
    marginBottom: 4,
  },
  dateBoxValue: {
    fontSize: 16,
    color: Colors.DARK_TEXT,
  },
})