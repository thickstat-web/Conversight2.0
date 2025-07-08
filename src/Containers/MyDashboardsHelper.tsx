import React, { useState, useEffect, useRef } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Switch,
  TextInput,
  Platform,
} from 'react-native'
import { View, Checkbox, Button } from 'react-native-ui-lib'
import DateTimePicker, { DateType, useDefaultStyles } from 'react-native-ui-datepicker'
import Icon from 'react-native-vector-icons/Ionicons'
import { useTheme } from '@/Hooks'
import { DateValue, Filter, FilterValue } from '@/Types/Pinboard'
import { properCase } from '@/Utils/common'
import { Colors } from '@/Theme/Variables'
import { LayoutNoInternet } from '@/Components'
import { useNetInfo } from '@react-native-community/netinfo'
import { useConverseResponseMutation } from '@/Services/modules/ingress'
import CustomSelect from '@/Components/CustomSelect'
import { getLocalStore } from '@/Utils/asyncStorage'
import dayjs from 'dayjs'
// Community DateTimePicker already imported above
import { reportPeriodsValues } from '@/Constants/reportPeriodsValues'

export type DasboardFilter = {
  type: string
  columnId: string
  columnName: string
  operator: string
  value: string
  dataSetId?: string
  category: string
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
    const { value, dateFrom, dateTo } = filter
    generatedFilter = {
      type: 'globalDateFilter',
      columnId: '',
      columnName: 'Report Period',
      operator: value !== 'between' ? 'is' : '',
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
  const { Fonts } = useTheme()
  const [uniqueValues, setUniqueValues] = useState<string[]>([])
  const [selectedColumn, setSelectedColumn] = useState<ColumnItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [converseResponse] = useConverseResponseMutation()
  const [modalVisible, setModalVisible] = useState(false)
  const [operatorValue, setOperatorValue] = useState('')
  const [multiSelect, setMultiSelect] = useState(true)
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [operators, setOperators] = useState<any>({})
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedDateRange, setSelectedDateRange] = useState<{ startDate: DateType, endDate: DateType }>({ startDate: selectedColumn?.dateFrom, endDate: selectedColumn?.dateTo })
  const [showPeriodPicker, setShowPeriodPicker] = useState(false)
  const [topMenuFilters, setTopMenuFilters] = useState<DasboardFilter[]>(filters)
  const [textInputValue, setTextInputValue] = useState('')
  const inputValueRef = useRef<string | null>(null);

  useEffect(() => {
    setLoading(true)
    const loadConfig = async () => {
      const configData = (await getLocalStore('conversight.dataset.config')) || {}
      console.log('config data is ',configData)
      setOperators(configData?.operators)
      setLoading(false)
    }
    loadConfig()
  }, [])

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

  const handleFilterValueClick = (columnItem: ColumnItem) => {
    setUniqueValues([])
    setSelectedColumn(columnItem);

    const existingFilter = topMenuFilters.find(
      f => f.columnId === columnItem.columnId
    );

    if (existingFilter) {
      setOperatorValue(existingFilter.operator || '');
      setSelectedValues(
        Array.isArray(existingFilter.value)
          ? existingFilter.value.map((v: any) => (typeof v === 'object' ? v.id : v))
          : existingFilter.value ? [existingFilter.value] : []
      );
      setTextInputValue(
        typeof existingFilter.value === 'string' ? existingFilter.value : ''
      );
      if (columnItem.category === 'dateFilter') {
        if (existingFilter.value === 'between' && existingFilter.operator === 'between') {
          setDateFilter('between');
          const match = (existingFilter.value || '').match(/(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/);
          if (match) {
            setSelectedDateRange({
              startDate: match[1],
              endDate: match[2],
            });
          } else {
            setSelectedDateRange({ startDate: undefined, endDate: undefined });
          }
        } else if (existingFilter.value) {
          setDateFilter(existingFilter.value);
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

  const handleResetFilters = () => {
    const resetFilters = topMenuFilters.map(filter => ({
      ...filter,
      value: '',
      operator: '', 
    }));

    setTopMenuFilters(resetFilters);
    setSelectedValues([]);
    setTextInputValue('');
    setDateFilter('all');
    setSelectedDateRange({ startDate: undefined, endDate: undefined });
    setOperatorValue('');
    setSelectedColumn(null);
    setModalVisible(false);
    onFilterChange(resetFilters);
    toggleFilterModal(resetFilters);
  };

  const handleDone = () => {
    if (selectedColumn) {
      if (['like', 'not like'].includes(operatorValue) && textInputValue) {
        setSelectedValues([textInputValue]);
      }
      const dateFilterFromMenu = topMenuFilters.find(f => f.category === 'dateFilter');
      const reportPeriodFromMenu = topMenuFilters.find(f => f.columnName === "Report Period")

      const dimensionFilterFromMenu = topMenuFilters.find((f: any) =>
        f.category === 'dimensions' &&
        f.columnId !== selectedColumn.columnId
      );

      console.log('dimensionFilterFromMenu is ', dimensionFilterFromMenu)

      const dateRangeMatch = dateFilterFromMenu?.value?.match(/(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/);
      let retainFilters: any[] = [];

      // Add date filter if it exists in the data
      if (dateRangeMatch) {
        retainFilters.push({
          category: 'dateFilter',
          data_set: '',
          dateValueFrom: dateRangeMatch[1],
          dateValueTo: dateRangeMatch[2],
          dateValues: null,
          globalFilter: null,
          id: '',
          isDefault: true,
          isDisable: false,
          isSingleValue: false,
          operator: '',
          processedID: '',
          processedRequestID: '',
          value: [],
          vocabulary: null
        });
      } else if (reportPeriodFromMenu?.value) {
        retainFilters.push({
          category: "dateFilter",
          data_set: "",
          dateValueFrom: "",
          dateValues: null,
          dateValueTo: "",
          globalFilter: null,
          id: "",
          isDefault: true,
          isDisable: false,
          isSingleValue: false,
          operator: "",
          processedID: "",
          processedRequestID: "",
          value: reportPeriodFromMenu.value,
          vocabulary: null
        });
      }
      if (dimensionFilterFromMenu && typeof dimensionFilterFromMenu.value === 'string') {
        const valueArray = dimensionFilterFromMenu.value
          ?.split(',')
          .map((item: string) => item.trim())
          .filter(Boolean)
          .map((value: string) => ({ id: value, name: value }))

        retainFilters.push({
          category: 'dimensions',
          data_set: dimensionFilterFromMenu.dataSetId,
          dateValueFrom: "",
          dateValues: null,
          dateValueTo: "",
          globalFilter: {
            enabled: false,
            name: ""
          },
          id: dimensionFilterFromMenu.columnId,
          isDefault: false,
          isDisable: false,
          isSingleValue: false,
          operator: dimensionFilterFromMenu.operator,
          processedID: dimensionFilterFromMenu.columnName,
          processedRequestID: '',
          value: valueArray,
          vocabulary: [dimensionFilterFromMenu.columnId]
        });
      }

      const addedFilterIds = new Set();

      data.forEach((item: any) => {
        if (item.category !== 'dateFilter' &&
          item.id !== selectedColumn.columnId &&
          item.category === 'dimensions' &&
          !addedFilterIds.has(item.id)) {
          addedFilterIds.add(item.id);

          retainFilters.push({
            category: item.category,
            data_set: item.data_set || '',
            dateValueFrom: '',
            dateValues: null,
            dateValueTo: '',
            globalFilter: {
              enabled: false,
              name: ""
            },
            id: item.id || '',
            isDefault: false,
            isDisable: false,
            isSingleValue: false,
            operator: item.operator || 'is',
            processedID: `${item.data_set ? `${item.data_set.split('-')[0]}_Data.` : ''}${item.columnName}`,
            processedRequestID: '',
            value: item.value || [],
            vocabulary: item.vocabulary || [item.id]
          });
        }
      });

      // Create new filter item based on selected column type
      let innerItem: any;

      if (selectedColumn.category === 'dateFilter') {
        // Create date filter with exact expected structure
        innerItem = {
          category: 'dateFilter',
          data_set: '',
          dateValueFrom: dateFilter === 'between' && selectedDateRange.startDate ?
            dayjs(selectedDateRange.startDate).format('MM/DD/YYYY') : '',
          dateValues: null,
          dateValueTo: dateFilter === 'between' && selectedDateRange.endDate ?
            dayjs(selectedDateRange.endDate).format('MM/DD/YYYY') : '',
          globalFilter: null,
          id: '',
          isDefault: true,
          isDisable: false,
          isSingleValue: false,
          operator: '',
          processedID: '',
          processedRequestID: '',
          value: dateFilter === 'all dates' ? [] : (dateFilter === 'between' ? 'between' : dateFilter),
          vocabulary: null
        };

        // Update the first item in retainFilters (the dateFilter)
        if (retainFilters.length > 0 && retainFilters[0].category === 'dateFilter') {
          retainFilters[0] = innerItem;
        } else {
          // If somehow the dateFilter is not first, add this as a new filter
          retainFilters.push(innerItem);
        }
      } else if (selectedColumn.category === 'dimensions') {
        // Create dimensions filter with exact expected structure
        innerItem = {
          category: 'dimensions',
          data_set: selectedColumn.dataSetId || '',
          dateValueFrom: '',
          dateValues: null,
          dateValueTo: '',
          globalFilter: {
            enabled: false,
            name: ""
          },
          id: selectedColumn.columnId || '',
          isDefault: false,
          isDisable: false,
          isSingleValue: false,
          operator: operatorValue || 'is',
          processedID: selectedColumn.columnName || '',
          processedRequestID: '',
          value: selectedValues.map(value => ({
            id: value,
            name: value
          })),
          vocabulary: [selectedColumn.columnId]
        };
        retainFilters.push(innerItem);
      } else {
        // For other filter types
        innerItem = {
          category: selectedColumn.category,
          data_set: selectedColumn.dataSetId || '',
          dateValueFrom: '',
          dateValues: null,
          dateValueTo: '',
          globalFilter: {
            enabled: false,
            name: ""
          },
          id: selectedColumn.columnId || '',
          isDefault: false,
          isDisable: false,
          isSingleValue: !multiSelect,
          operator: operatorValue || 'is',
          processedID: selectedColumn.columnId || '',
          processedRequestID: '',
          value: [],
          vocabulary: null,
        };
        retainFilters.push(innerItem);
      }

      // For other filter categories that need special handling
      if (selectedColumn.category === 'date') {
        if (operatorValue === 'between') {
          innerItem.value = selectedValues;
        } else {
          innerItem.value = selectedValues[0];
        }
      } else if (selectedColumn.category === 'flag') {
        innerItem.value = selectedValues;
      }

      // Filter out dimension filters with 'all' value
      retainFilters = retainFilters.filter(filter => {
        if (filter.category === 'dimensions' && filter.value && Array.isArray(filter.value)) {
          return !filter.value.some((v: any) => v.id === 'all' || v.name === 'all');
        }
        return true;
      });

      // No need to push innerItem again as it was already added above

      const newTopMenuFilters: DasboardFilter[] = [...topMenuFilters];
      const dateFilterIndex = newTopMenuFilters.findIndex(f => f.category === 'dateFilter');

      // Preserve existing dimension filters when selecting date filter
      const existingDimensionFilters = topMenuFilters.filter(f => f.category === 'dimensions');

      // Handle the date filter based on the current selection
      if (selectedColumn.category === 'dateFilter') {
        if (dateFilter === 'all') {
          // If 'All Dates' is selected, remove the date filter if it exists
          if (dateFilterIndex >= 0) {
            newTopMenuFilters.splice(dateFilterIndex, 1);
          }
          // Keep existing dimension filters
          onFilterChange?.([...existingDimensionFilters, ...retainFilters]);
          return;
        } else {
          // If a specific date filter (predefined or custom) is selected, update or add it
          const newDateFilter = {
            category: 'dateFilter',
            columnId: '',
            columnName: 'Report Period',
            dataSetId: '',
            operator: dateFilter === 'between' ? 'between' : '',
            type: 'globalDateFilter',
            value: dateFilter === 'between' && selectedDateRange.startDate && selectedDateRange.endDate
              ? `${dayjs(selectedDateRange.startDate).format('MM/DD/YYYY')} - ${dayjs(selectedDateRange.endDate).format('MM/DD/YYYY')}`
              : dateFilter
          };

          // Update or add the date filter while preserving dimension filters
          if (dateFilterIndex >= 0) {
            newTopMenuFilters[dateFilterIndex] = newDateFilter;
          } else {
            newTopMenuFilters.unshift(newDateFilter);
          }

          // Combine existing dimension filters with the new date filter
          onFilterChange?.([...existingDimensionFilters, ...newTopMenuFilters]);
          // setModalVisible(false);

        }
      } else { // Handle other column filters
        // Update or add the selected column filter
        const columnFilterIndex = newTopMenuFilters.findIndex(f => f.columnId === selectedColumn.columnId);
        const newColumnFilter = {
          category: selectedColumn.category,
          columnId: selectedColumn.columnId,
          columnName: selectedColumn.columnName,
          dataSetId: selectedColumn.dataSetId || '',
          operator: operatorValue || 'is',
          type: selectedColumn.category,
          value: Array.isArray(innerItem.value)
            ? innerItem.value.map((v: any) => v.name || v).join(', ')
            : innerItem.value
        };

        if (columnFilterIndex >= 0) {
          newTopMenuFilters[columnFilterIndex] = newColumnFilter;
        } else {
          newTopMenuFilters.push(newColumnFilter);
        }
      }

      setTopMenuFilters(newTopMenuFilters);
      onFilterChange({
        column: selectedColumn,
        value: selectedValues,
        operator: operatorValue,
        dateRange: selectedDateRange,
        retainFilters
      });

      setModalVisible(false);
      setSelectedColumn(null);
      setSelectedValues([]);
      setMultiSelect(false);
      setDateFilter('all');
      setSelectedDateRange({ startDate: undefined, endDate: undefined });
      toggleFilterModal(retainFilters);
    }
  }

  const renderFilter = ({ item: filter }: { item: DasboardFilter }) => {
    return (
      <TouchableOpacity
        style={styles.filterPressable}
        onPress={() => handleFilterValueClick(filter)}
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
          <Text style={[Fonts.textSmall, styles.filterColumnName]}>
            {properCase(filter.columnName)}
          </Text>
          <Text style={[Fonts.textSmall, styles.filterValueText]}>
            {filter.operator} {filter.value}
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
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.reportPeriodDropdown}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.sectionTitle}>Report Period Settings</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close-circle-outline" size={24} color={Colors.GREEN_DARK} />
              </TouchableOpacity>
            </View>
            {selectedColumn?.category === 'dateFilter' ? (
              <View>
                <View style={styles.section}>
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      dateFilter === 'between' && styles.inactiveSelectButton,
                    ]}
                    onPress={() => {
                      if (dateFilter !== 'between') {
                        setShowPeriodPicker(true)
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.selectButtonText,
                        dateFilter === 'between' && styles.inactiveSelectButtonText,
                      ]}
                    >
                      {dateFilter === 'between'
                        ? 'Select a period'
                        : dateFilter === 'all'
                          ? 'Select a period'
                          : reportPeriodsValues.find(p => p.value === dateFilter)?.text || 'Select period'}
                    </Text>
                    <Icon
                      name="chevron-down"
                      size={24}
                      color={dateFilter === 'between' ? Colors.GRAY : Colors.GREEN_DARK}
                    />
                  </TouchableOpacity>
                  <Modal visible={showPeriodPicker} transparent animationType="slide">
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
                          onPress={() => setShowPeriodPicker(false)}
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
                      <View style={{ height: '30%' }}>
                        <View style={{ maxHeight: '20%' }}>

                          <DateTimePicker
                            mode="range"
                            styles={{
                              selected: { backgroundColor: Colors.GREEN_MAIN },
                              disabled: { backgroundColor: Colors.GRAY_DARK }
                            }}
                            startDate={selectedDateRange.startDate}
                            endDate={selectedDateRange.endDate}
                            onChange={(range) => {
                              if (range.endDate && dayjs(range.endDate).isAfter(dayjs())) {
                                setSelectedDateRange({ startDate: range.startDate, endDate: dayjs() });
                              } else {
                                setSelectedDateRange(range);
                              }
                            }}
                            maxDate={dayjs().endOf('day').toDate()}
                            disabledDates={(date) => dayjs(date).isAfter(dayjs(), 'day')}
                          />
                        </View>
                        <View>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </View>

            ) : (
              <View>
                <View style={styles.operatorContainer}>
                  <Text style={styles.operatorLabel}>Operator</Text>
                  <View style={styles.operatorOptions}>
                    {selectedColumn?.category && operators?.[selectedColumn.category]?.map((option: any) => (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.operatorOption,
                          operatorValue === option.id && styles.selectedOperator,
                        ]}
                        onPress={() => {
                          setOperatorValue(option.id);
                        }}
                      >
                        <Text
                          style={[
                            styles.operatorText,
                            operatorValue === option.id && styles.selectedOperatorText,
                          ]}
                        >
                          {option.name || option.id}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                {!['like', 'not like'].includes(operatorValue) ? (
                  <>
                    <View style={styles.toggleRow}>
                      <Text style={styles.sectionTitle}>Enable Multi-Select</Text>
                      <Switch
                        value={multiSelect}
                        onValueChange={setMultiSelect}
                        trackColor={{ false: Colors.GRAY_LIGHT, true: Colors.GREEN_MAIN }}
                        thumbColor={Colors.GREEN_LIGHTEST}
                        style={styles.toggleSwitch}
                      />
                    </View>
                    <CustomSelect
                      mode={multiSelect ? 'MULTI' : 'SINGLE'}
                      options={uniqueValues.map(v => ({ label: v, value: v }))}
                      value={selectedValues}
                      onChange={setSelectedValues}
                      placeholder="Select value(s)"
                      loading={loading}
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
                  opacity: (selectedColumn?.category === 'dateFilter' && !((dateFilter !== 'all' && dateFilter !== 'between') || (dateFilter === 'between' && selectedDateRange.startDate && selectedDateRange.endDate))) ? 0.5 : 1 // Dim when disabled
                }}
                disabled={selectedColumn?.category === 'dateFilter' && !((dateFilter !== 'all' && dateFilter !== 'between') || (dateFilter === 'between' && selectedDateRange.startDate && selectedDateRange.endDate))}
              />
            </View>
          </View>
        </View>
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
    color:Colors.GREEN_DARK
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
    color:Colors.TEXT_BLACK,
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
    marginBottom:10,
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
})