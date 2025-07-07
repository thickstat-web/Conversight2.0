import React, { useState, useEffect, useMemo, useRef } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch, Platform, ActivityIndicator, TextInput } from 'react-native'
import {
  Button,
  Picker,
  TextField,
  Checkbox,
  Colors,
  Typography as UILTypography
} from 'react-native-ui-lib'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format, parseISO, isSameDay, isAfter, isBefore } from 'date-fns'
// Remove Ionicons import as we'll use react-native-ui-lib Icons instead
import Icon from 'react-native-vector-icons/Ionicons'
import isArray from 'lodash/isArray'
import orderBy from 'lodash/orderBy'
import toNumber from 'lodash/toNumber'
import { getLocalStore, setLocalStore } from '@/Utils/asyncStorage'
import {
  reportPeriodsValues,
  byPeriodFilterValues,
} from '@/Constants/reportPeriodsValues'
import { useAppSelector } from '@/Hooks'
import { selectProfile } from '@/Store/Settings'
import { constructUtterance, GenerateSemantics, UUID } from '@/Utils/common'
import { useConverseResponseMutation, useConverseResponseV2Mutation } from '@/Services/modules/ingress'
import CustomSelect from './CustomSelect'
import ColumnInfo from './ColumnInfo'
import { getKbnetData } from '@/Store/Kbnet'
import { getDatasets } from '@/Store/Auth'
import FilterModal from '@/Components/FilterModal'
import MobileFilterModal from '@/Components/MobileFilterModal'

interface guidedRuleType {
  hideDateFilter?: boolean
  hideDimensionFilter?: boolean
  hideMetricFilter?: boolean
  hideClearMetricField?: boolean
  hideClearDimensionField?: boolean
  hideClearDateField?: boolean
}

interface Props {
  columnItem: any
  onClose: (value?: any) => void
  onSubmit?: (value: any) => void
  FilterItemSelectedValues: (value: any) => void
  setColumnData: any
  customTitle?: string
  isSharedStoryBoard?: boolean
  guidedRule?: guidedRuleType
  setLoading: any
  categories?: string[]
  filters?: any
  subjectId?: string
  threadId?: string
  lastChatId?: string
  inputLeftValue?: string
  inputRightValue?: string
  isTop?: boolean
  compactMode?: boolean
}

const FilterEditContent: React.FC<Props> = (props) => {
  const user = useAppSelector(selectProfile)
  const [editOpen, setEditOpen] = useState<boolean>(false)
  const [btnLabel, setBtnLabel] = useState<string>('All')
  let [select2Options, setSelect2Options] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [loadFailed, setLoadFailed] = useState<boolean>(false)
  const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false)
  const [currentEditingDateIndex, setCurrentEditingDateIndex] = useState<number>(0)
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null)
  const [dateValues, setDateValues] = useState<any[]>([
    { dateValueFrom: null, dateValueTo: null },
  ])
  const [operatorValue, setOperatorValue] = useState<string>('')
  const [inputValue, setInputValue] = useState<string>("")
  const [inputValueNumber, setInputValueNumber] = useState<
    number | string | null
  >(null)
  const [inputValueNumberTo, setInputValueNumberTo] = useState<
    number | string | null
  >(null)
  const [isSingleValue, setIsSingleValue] = useState(false)
  const [globalFilterItems, setGlobalFilterItems] = useState<any[]>([])
  const [newGlobalFilterName, setNewGlobalFilterName] = useState('')
  const [globalFilter, setGlobalFilter] = useState({ enabled: false, name: '' })
  const inputRef = useRef<any>(null)

  const [operators, setOperators] = useState<any>({})
  const [aggregationValues, setAggregationValues] = useState<any>({})
  const [converseResponse, { data, error, isLoading }] =
    useConverseResponseMutation()
  const [converseResponseV2] = useConverseResponseV2Mutation()
  const onNameChange = (text: string) => {
    setNewGlobalFilterName(text)
  }
  const kbnet = useAppSelector(getKbnetData)
  const dataset = useAppSelector(getDatasets)

  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [uniqueValues, setUniqueValues] = useState<string[]>([])

  const addItem = () => {
    if (newGlobalFilterName) {
      setGlobalFilterItems([...globalFilterItems, newGlobalFilterName])
      setNewGlobalFilterName('')
      inputRef.current?.focus()
    }
  }

  useEffect(() => {
    const key = `conversight.${user?.orgId}.${user?.email?.replace?.(
      /[.]/g,
      '@',
    )}.dashboard.gbFilters`

    const initializeFilters = async () => {
      const defaultFilters = ['Filter A', 'Filter B']
      await setLocalStore(key, defaultFilters)
      const storedItems = await getLocalStore(key)
      setGlobalFilterItems(storedItems)
    }
    if (user?.orgId && user?.email) {
      initializeFilters()
    }
  }, [user])

  useEffect(() => {
    setLoading(true)
    const loadConfig = async () => {
      const configData =
        (await getLocalStore('conversight.dataset.config')) || {}
      setOperators(configData?.operators)
      setAggregationValues(configData?.aggregationValues)
      setLoading(false)
    }
    loadConfig()
  }, [])

  useEffect(() => {
    setLocalStore(
      `conversight.${user?.orgId}.${user?.email?.replace?.(
        /[.]/g,
        '@',
      )}.dashboard.gbFilters`,
      globalFilterItems,
    )
  }, [globalFilterItems])

  useEffect(() => {
    if (
      ['dimensions', 'Smart Column', 'calculated dimension', 'flag'].includes(
        props.columnItem.category,
      ) &&
      props.columnItem.is_editable &&
      editOpen &&
      !props?.columnItem?.isAggregation &&
      !select2Options?.length
    ) {
      askAthena(UUID())
    }
  }, [editOpen])

  useEffect(() => {
    if (props?.columnItem && !props?.columnItem?.editedContent) {
      let operator = props?.columnItem?.operator
      let value = isArray(props?.columnItem?.value)
        ? props?.columnItem?.value.map(
          (valueItem: any) => valueItem.id + '@@' + valueItem.name,
        )
        : props?.columnItem?.value

      if (
        ['dimensions', 'Smart Column', 'calculated dimension'].includes(
          props.columnItem.category,
        )
      ) {
        operator = operator || operators?.dimensions?.[0]?.id
        value = value || []
      } else if (props.columnItem.category === 'metrics') {
        operator = operator || operators?.metrics?.[0]?.id
      } else if (props.columnItem.category === 'date') {
        operator = props?.columnItem?.isAggregation ? '' : operator || 'is'
        value = value || reportPeriodsValues[0].value
      } else if (props.columnItem.category === 'flag') {
        operator = operator || '='
      }

      setGlobalFilter(props?.columnItem?.globalFilter || { ...globalFilter })

      const dateValuesArray = props?.columnItem?.dateValues?.length
        ? props?.columnItem?.dateValues.map((data: any) => ({
          dateValueFrom: data.dateValueFrom
            ? parseISO(data.dateValueFrom)
            : null,
          dateValueTo: data.dateValueTo ? parseISO(data.dateValueTo) : null,
        }))
        : [{ dateValueFrom: null, dateValueTo: null }]

      setDateValues(dateValuesArray)
      setOperatorValue(operator || 'is')
      setInputValue(value)

      const valueTemplate = props?.columnItem?.dateValues?.length
        ? constructDateValuesText(dateValuesArray)
        : value?.[0]?.includes('@@')
          ? value
            ?.map((valueItem: any) => valueItem?.split?.('@@')?.[1])
            ?.join?.(', ')
          : value?.join?.(', ') || value

      setBtnLabel(
        `${valueTemplate?.length && valueTemplate !== 'all'
          ? props?.columnItem?.dateValues?.length
            ? valueTemplate
            : operator + ' ' + valueTemplate
          : 'All'
        }`,
      )
      setIsSingleValue(props?.columnItem?.isSingleValue)
    } else {
      setOperatorValue(props?.columnItem?.editedContent?.operatorValue)
      setInputValue(props?.columnItem?.editedContent?.inputValue)
      setDateValues(
        props?.columnItem?.editedContent?.dateValues?.length
          ? props?.columnItem?.editedContent?.dateValues.map((data: any) => ({
            dateValueFrom: data.dateValueFrom
              ? parseISO(data.dateValueFrom)
              : null,
            dateValueTo: data.dateValueTo ? parseISO(data.dateValueTo) : null,
          }))
          : [{ dateValueFrom: null, dateValueTo: null }],
      )
      setBtnLabel(props?.columnItem?.editedContent?.btnLabel)
      setIsSingleValue(props?.columnItem?.editedContent?.isSingleValue)
    }
  }, [props?.columnItem])

  useEffect(() => {
    props.FilterItemSelectedValues({
      operatorValue,
      inputValue,
      dateValues,
      inputValueNumber,
      inputValueNumberTo,
      inputLeftValue: props?.inputLeftValue,
      inputRightValue: props?.inputRightValue,
      btnLabel,
      isSingleValue,
      globalFilter,
    })
  }, [
    operatorValue,
    inputValue,
    inputValueNumber,
    inputValueNumberTo,
    dateValues,
    props?.inputLeftValue,
    props?.inputRightValue,
    isSingleValue,
    globalFilter,
  ])

  const constructDateValuesText = (dateValuesInfo: any) => {
    let text = 'between '
    dateValuesInfo.forEach((item: any, index: number) => {
      if (item.dateValueFrom && item.dateValueTo) {
        text += `${item.dateValueFrom ? format(item.dateValueFrom, 'MM/dd/yyyy') : ''
          } ${item.dateValueTo
            ? ' and ' + format(item.dateValueTo, 'MM/dd/yyyy')
            : ''
          }${index + 1 === dateValuesInfo.length ? '' : ' Vs '}`
      }
    })
    return text.trim()
  }

  const askAthena = async (UUID: string) => {
    // Set component's local loading state to true before the API call
    setLoading(true)

    if (dataset?.find((item) => item?._key === props.columnItem.data_set)?.mode === 'v2' &&
      dataset?.find((item) => item?._key === props.columnItem.data_set)?.athena_threads) {


      const { output, meta } = GenerateSemantics([props?.columnItem], [], kbnet[props?.columnItem?.data_set]?.metadata?.data);

      const utterance = constructUtterance([props?.columnItem])




      const requestV2Payload: any = {
        source: 'web',
        timezone: new Date().getTimezoneOffset().toString(),
        sessionId: '',
        topicId: 'default',
        instructions: [
          {
            command: 'execute',
            type: output ? '_LF' : '_NL',
            input: {
              question: utterance,
              datasetId: props.columnItem.data_set,
              requestId: UUID,
              semantics: output || null,
              metadata: meta || null,
              filters: props?.filters || null,
            },
            ctx: {
              subjectId: props?.subjectId,
              threadID: props?.threadId,
              lastChatId: props?.lastChatId,
            },
          },
        ],
      }


    }



    try {
      const requestPayload: any = {
        session: {
          message: {
            text: props.columnItem.processedID,
            displayUtterance: '',
            domain: '',
            dataSet: props.columnItem.data_set,
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
      // console.log('response v2 is ', responseV2)
      if (response) {
        const firstItem = response?.data[0]
        if (firstItem) {
          delete firstItem.__id
          const ojbKey = Object.keys(firstItem)[0]
          const ojbKey2 = Object.keys(firstItem)[1]
          setSelect2Options(
            response.data.map((item: any) => ({
              id: item[ojbKey],
              name: item[ojbKey2] || item[ojbKey],
              tooltip: ojbKey2,
            })),
          )
        }
      }
    } catch (error) {
      console.error('Error fetching options:', error)
      setLoadFailed(true)
    } finally {
      setLoading(false)
    }
  }

  const setDateFilterValues = () => {
    setDateValues([...dateValues, { dateValueFrom: null, dateValueTo: null }])
  }

  const removeAddedDate = (index: number) => {
    const dateValuesCopy = [...dateValues]
    dateValuesCopy.splice(index, 1)
    setDateValues(dateValuesCopy)
    setBtnLabel(constructDateValuesText(dateValuesCopy))
  }

  const ErrorMsg = () => (
    <View style={styles.errorContainer}>
      <Icon name="close-circle" size={40} color={Colors.red30} />
      <Text style={styles.errorText}>
        There are some problems fetching the values.
      </Text>
      <Text style={styles.errorSubText}>
        This has been notified to the technical team.
      </Text>
      <Button
        label="Try again"
        size="small"
        onPress={() => {
          setLoading(true)
          setLoadFailed(false)
          askAthena(UUID())
        }}
        iconSource={() => (
          <Icon name="reload" size={16} style={{ marginRight: 5 }} />
        )}
      />
    </View>
  )

  const renderDateCustomContent = useMemo(() => {
    return dateValues.map((p: any, index: number) => (
      <View key={`iterator_d_picker_${index}`} style={styles.dateRangeCard}>
        <View style={styles.dateRangeHeader}>
          <Text style={styles.dateRangeTitle}>Date Range {index + 1}</Text>
          {dateValues.length > 1 && (
            <TouchableOpacity
              onPress={() => removeAddedDate(index)}
              style={styles.removeIconButton}
            >
              <Icon name="close-circle" size={20} color={Colors.red5} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.dateRangeRow}>
          <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerLabel}>From</Text>
            <TouchableOpacity
              style={styles.customDatePicker}
              onPress={() => {
                // Store current editing date index and toggle start date picker
                setCurrentEditingDateIndex(index);
                setShowStartDatePicker(true);
                // Make sure end date picker is closed
                setShowEndDatePicker(false);
              }}
            >
              <Text style={styles.dateText}>
                {p.dateValueFrom ? format(p.dateValueFrom, 'MM/dd/yyyy') : 'Select start date'}
              </Text>
              <Icon name="calendar-outline" size={18} color={Colors.GREEN_DARK} />
            </TouchableOpacity>
          </View>
          <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerLabel}>To</Text>
            <TouchableOpacity
              style={styles.customDatePicker}
              onPress={() => {
                // Store current editing date index and toggle end date picker
                setCurrentEditingDateIndex(index);
                setShowEndDatePicker(true);
                // Make sure start date picker is closed
                setShowStartDatePicker(false);
              }}
            >
              <Text style={styles.dateText}>
                {p.dateValueTo ? format(p.dateValueTo, 'MM/dd/yyyy') : 'Select end date'}
              </Text>
              <Icon name="calendar-outline" size={18} color={Colors.GREEN_DARK} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ))
  }, [dateValues, showStartDatePicker, showEndDatePicker, currentEditingDateIndex])

  const SelectOptionMemo = useMemo(() => {
    const checkDataType = !toNumber(select2Options[0]?.name)
    if (checkDataType) {
      select2Options = orderBy(select2Options, ['name'], ['asc'])
    }
    return select2Options.map((opt: any) => ({
      value: opt.id + '@@' + opt.name,
      label: opt.name,
    }))
  }, [select2Options])

  const metricsContent = props?.columnItem?.isAggregation ? (
    <View style={styles.selectorCard}>
      {!props?.guidedRule?.hideClearMetricField && (
        <Button
          label="Clear All"
          size="small"
          link
          onPress={() => {
            setBtnLabel('All')
            setInputValue("")
          }}
          style={styles.clearButton}
          labelStyle={styles.clearButtonLabel}
          iconSource={() => (
            <Icon
              name="close-circle"
              size={16}
              color={Colors.RED}
              style={styles.clearIcon}
            />
          )}
        />
      )}
      <Picker
        placeholder="Select"
        value={inputValue}
        onChange={(value: any) => {
          setInputValue(value)
          setBtnLabel(value)
        }}
        style={styles.picker}
        renderPicker={(selectedItem: any, label: string) => (
          <View style={styles.pickerInnerContainer}>
            <Text style={styles.pickerText}>{label || 'Select'}</Text>
            <Icon name="chevron-down" size={16} color={Colors.GREEN_DARK} />
          </View>
        )}
      >
        {aggregationValues?.metrics?.map((o: any, i: number) => (
          <Picker.Item key={`agg_metrics_${i}`} value={o.id} label={o.name} />
        ))}
      </Picker>
    </View>
  ) : (
    <View style={styles.selectorCard}>
      <Button
        label="Clear All"
        link
        onPress={() => {
          setBtnLabel('All')
          setOperatorValue(operators?.metrics?.[0]?.id)
          setInputValueNumber('')
          setInputValueNumberTo('')
        }}
        style={styles.clearButton}
        labelStyle={styles.clearButtonLabel}
        iconSource={() => (
          <Icon
            name="close-circle"
            size={16}
            color={Colors.RED}
            style={styles.clearIcon}
          />
        )}
      />
      <Picker
        placeholder="Select Operator"
        value={operatorValue}
        onChange={(value: any) => {
          setOperatorValue(value)
          setBtnLabel(
            value === 'between'
              ? `between ${inputValueNumber || ''} ${inputValueNumberTo ? ' and ' + inputValueNumberTo : ''
              }`
              : `${value + ' ' + inputValueNumber}`,
          )
        }}
        style={styles.picker}
        renderPicker={(selectedItem: any, label: string) => (
          <View style={styles.pickerInnerContainer}>
            <Text style={styles.pickerText}>{label || 'Select Operator'}</Text>
            <Icon name="chevron-down" size={16} color={Colors.GREEN_DARK} />
          </View>
        )}
      >
        {operators?.metrics?.map((o: any, i: number) => (
          <Picker.Item key={`operators_${i}`} value={o.id} label={o.id} />
        ))}
      </Picker>
      <TextField
        placeholder={operatorValue !== 'between' ? 'Value' : 'From'}
        value={inputValueNumber?.toString()}
        onChangeText={(text: React.SetStateAction<string | number | null>) => {
          setInputValueNumber(text)
          setBtnLabel(
            `${operatorValue} ${text} ${inputValueNumberTo ? ' and ' + inputValueNumberTo : ''
            }`,
          )
        }}
        keyboardType="numeric"
        style={styles.textInput}
        floatingPlaceholder
      />
      {operatorValue === 'between' && (
        <TextField
          placeholder="To"
          value={inputValueNumberTo?.toString()}
          onChangeText={(
            text: React.SetStateAction<string | number | null>,
          ) => {
            setInputValueNumberTo(text)
            setBtnLabel(
              `${inputValueNumber
                ? `${operatorValue} ${inputValueNumber} and ${text}`
                : operatorValue
              }`,
            )
          }}
          keyboardType="numeric"
          style={styles.textInput}
          floatingPlaceholder
        />
      )}
    </View>
  )

  const flagContent = loading ? (
    <ActivityIndicator />
  ) : loadFailed ? (
    <ErrorMsg />
  ) : (
    <View style={styles.selectorCard}>
      <Button
        label="Clear All"
        link
        onPress={() => {
          setBtnLabel('All')
          setOperatorValue('')
          setInputValue("")
        }}
        style={styles.clearButton}
        labelStyle={styles.clearButtonLabel}
        iconSource={() => (
          <Icon
            name="close-circle"
            size={16}
            color={Colors.RED}
            style={styles.clearIcon}
          />
        )}
      />
      <Picker
        placeholder="Select Operator"
        value={operatorValue || operators?.dimensions?.[0]?.id}
        onChange={(value: any) => {
          setInputValue("")
          setOperatorValue(value)
          setBtnLabel(value.length ? `${value} All` : 'All')
        }}
        disabled={!operators?.dimensions?.length}
        style={styles.picker}
        renderPicker={(selectedItem: any, label: string) => (
          <View style={styles.pickerInnerContainer}>
            <Text style={styles.pickerText}>{label || 'Select Operator'}</Text>
            <Icon name="chevron-down" size={16} color={Colors.GREEN_DARK} />
          </View>
        )}
      >
        {operators?.flag?.map((o: any, i: number) => (
          <Picker.Item key={`filter_dim_${i}`} value={o.id} label={o.name} />
        ))}
      </Picker>
      <Picker
        placeholder="Select Value"
        value={inputValue}
        onChange={(value: any) => {
          const displayVal = value.includes('@@')
            ? value.split('@@')[1]?.trim()
            : value
          setInputValue(displayVal)
          setBtnLabel(value.length ? `${operatorValue} ${displayVal}` : 'All')
        }}
        disabled={!select2Options.length}
        style={styles.picker}
        renderPicker={(selectedItem: any, label: string) => (
          <View style={styles.pickerInnerContainer}>
            <Text style={styles.pickerText}>{label || 'Select Value'}</Text>
            <Icon name="chevron-down" size={16} color={Colors.GREEN_DARK} />
          </View>
        )}
      >
        {SelectOptionMemo.map(opt => (
          <Picker.Item key={opt.value} value={opt.value} label={opt.label} />
        ))}
      </Picker>
    </View>
  )

  const dimensionsContent = props?.columnItem?.isAggregation ? (
    <View style={styles.selectorCard}>
      {!props?.guidedRule?.hideClearDimensionField && (
        <Button
          label="Clear All"
          size="small"
          link
          onPress={() => {
            setBtnLabel('All')
            setInputValue("")
          }}
          style={styles.clearButton}
          labelStyle={styles.clearButtonLabel}
          iconSource={() => (
            <Icon
              name="close-circle"
              size={16}
              color={Colors.RED}
              style={styles.clearIcon}
            />
          )}
        />
      )}
      <Picker
        placeholder="Select"
        value={inputValue}
        onChange={(value: any) => {
          setInputValue(value)
          setBtnLabel(value)
        }}
        style={styles.picker}
        renderPicker={(selectedItem: any, label: string) => (
          <View style={styles.pickerInnerContainer}>
            <Text style={styles.pickerText}>{label || 'Select'}</Text>
            <Icon name="chevron-down" size={16} color={Colors.GREEN_DARK} />
          </View>
        )}
      >
        {aggregationValues?.dimensions?.map((o: any, i: number) => (
          <Picker.Item key={`agg_dim_${i}`} value={o.id} label={o.name} />
        ))}
      </Picker>
    </View>
  ) : loading ? (
    <ActivityIndicator />
  ) : loadFailed ? (
    <ErrorMsg />
  ) : (
    <View style={styles.dimensionsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Filter Options</Text>
        <Button
          label="Clear All"
          size="small"
          link
          onPress={() => {
            setBtnLabel('All')
            setOperatorValue('')
            setInputValue("")
          }}
          style={styles.clearButton}
          labelStyle={styles.clearButtonLabel}
          iconSource={() => (
            <Icon
              name="close-circle"
              size={16}
              color={Colors.RED}
              style={styles.clearIcon}
            />
          )}
        />
      </View>

      <View style={styles.pickerCard}>
        <Text style={styles.sectionTitle}>Operator</Text>
        <CustomSelect
          mode="SINGLE"
          options={
            operators?.dimensions?.map((o: any) => ({
              value: o.id,
              label: o.name || o.id,
            })) || []
          }
          value={
            operatorValue ||
            (operators?.dimensions?.[0]?.id
              ? [operators?.dimensions?.[0]?.id]
              : [])
          }
          onChange={(value: string[]) => {
            setInputValue("")
            setOperatorValue(value[0])
            setBtnLabel(value[0]?.length ? `${value[0]} All` : 'All')
          }}
          placeholder="Select Operator"
          style={styles.selectorStyle}
          loading={loading}
        />
      </View>
      <View style={styles.selectorCard}>
        <View style={styles.toggleRow}>
          <Text style={styles.sectionTitle}>Enable Multi-Select</Text>
          <Switch
            value={!isSingleValue}
            onValueChange={(value: any) => {
              setIsSingleValue(!value)
              if (inputValue?.length) {
                const displayVal = inputValue[0].includes('@@')
                  ? inputValue[0].split('@@')[1]?.trim()
                  : inputValue[0]
                setBtnLabel(`${operatorValue} ${displayVal}`)
                setInputValue([inputValue[0]])
              }
            }}
            trackColor={{ false: Colors.GREY, true: Colors.green5 }}
            thumbColor={Colors.WHITE}
            style={styles.toggleSwitch}
          />
        </View>

        {operatorValue !== 'like' && operatorValue !== 'not like' ? (
          <CustomSelect
            mode={isSingleValue ? 'SINGLE' : 'MULTI'}
            options={SelectOptionMemo}
            value={Array.isArray(inputValue) ? inputValue : [inputValue]}
            onChange={val => {
              setInputValue(val)
              const displayVal = val.map((valueItem: any) =>
                typeof valueItem === 'string' && valueItem.includes('@@')
                  ? valueItem.split('@@')[1]?.trim()
                  : String(valueItem),
              )
              const opVal =
                typeof operatorValue === 'string'
                  ? operatorValue
                  : operatorValue?.value || ''
              setBtnLabel(
                val.length ? `${opVal} ${displayVal.join(', ')}` : 'All',
              )
            }}
            selectorStyle={styles.selectorStyle}
            checkboxColor={Colors.GREEN_DARK}
            buttonStyle={styles.customSelectButton}
            dropdownStyle={styles.dropdownStyle}
            selectedItemStyle={styles.selectedItem}
            searchInputStyle={styles.searchInput}
            loading={loading}
          />
        ) : (
          <TextField
            placeholder="Enter filter value"
            value={
              typeof inputValue === 'string' && inputValue.includes('@@')
                ? inputValue.replace('@@', '')
                : inputValue
            }
            onChangeText={(text: string) => {
              setInputValue(text)
            }}
            style={styles.textInput}
            placeholderTextColor={Colors.PLACEHOLDER}
          />
        )}
      </View>
    </View>
  )

  const dateContent = props?.columnItem?.isAggregation ? (
    <View style={styles.selectorCard}>
      {!props?.guidedRule?.hideClearDateField && (
        <Button
          label="Clear All"
          size="small"
          link
          onPress={() => {
            setBtnLabel('All')
            setInputValue("")
          }}
          style={styles.clearButton}
          labelStyle={styles.clearButtonLabel}
          iconSource={() => (
            <Icon
              name="close-circle"
              size={16}
              color={Colors.RED}
              style={styles.clearIcon}
            />
          )}
        />
      )}
      <CustomSelect
        mode="SINGLE"
        options={
          aggregationValues?.date?.map((o: any) => ({
            value: o.id,
            label: o.name,
          })) || []
        }
        value={
          inputValue ||
          (reportPeriodsValues[0]?.value
            ? [reportPeriodsValues[0]?.value]
            : ['all'])
        }
        onChange={(value: string[]) => {
          setInputValue(value[0])
          setBtnLabel(value[0])
        }}
        placeholder="Select"
        style={styles.selectorStyle}
        loading={loading}
      />
    </View>
  ) : (
    <View style={styles.dimensionsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Filter Options</Text>
        <Button
          label="Clear All"
          link
          onPress={() => {
            setBtnLabel('All')
            setOperatorValue('is')
            setInputValue('all')
            setDateValues([{ dateValueFrom: null, dateValueTo: null }])
          }}
          style={styles.clearButton}
          labelStyle={styles.clearButtonLabel}
          iconSource={() => (
            <Icon
              name="close-circle"
              size={16}
              color={Colors.RED}
              style={styles.clearIcon}
            />
          )}
        />
      </View>
      <View style={styles.selectorCard1}>
        <Text style={styles.periodTitle}>Select Period</Text>
        <CustomSelect
          mode="SINGLE"
          options={reportPeriodsValues.map((p: any) => ({
            value: p.value,
            label: p.text,
          }))}
          value={inputValue ? [inputValue] : [reportPeriodsValues[0].value]}
          onChange={(value: string[]) => {
            const selectedValue = value[0]
            setInputValue(selectedValue as string)
            setOperatorValue(selectedValue !== 'between' ? 'is' : 'between')
            setBtnLabel(
              selectedValue === 'between'
                ? constructDateValuesText(dateValues)
                : `${selectedValue !== 'all' ? 'is ' + selectedValue : 'All'}`,
            )
          }}
          placeholder="Select Period"
          style={styles.selectorStyle}
          loading={loading}
        />

        {operatorValue === 'between' && renderDateCustomContent}
        {operatorValue === 'between' && dateValues.length < 3 && (
          <TouchableOpacity
            style={styles.addDateRangeButton}
            onPress={setDateFilterValues}
          >
            <Icon name="add" size={20} color={Colors.white} />
            <Text style={styles.addDateRangeText}>Add Another Date Range</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  const forPeriodContent = (
    <View style={styles.selectorCard}>
      <Button
        label="Clear All"
        link
        onPress={() => {
          setBtnLabel('All')
          setOperatorValue('is')
          setInputValue('all')
          setDateValues([{ dateValueFrom: null, dateValueTo: null }])
        }}
        style={styles.clearButton}
        labelStyle={styles.clearButtonLabel}
        iconSource={() => (
          <Icon
            name="close-circle"
            size={16}
            color={Colors.RED}
            style={styles.clearIcon}
          />
        )}
      />

      <Text style={styles.periodTitle}>Select Period</Text>
      <CustomSelect
        mode="SINGLE"
        options={reportPeriodsValues.map((p: any) => ({
          value: p.value,
          label: p.text,
        }))}
        value={inputValue ? [inputValue] : [reportPeriodsValues[0].value]}
        onChange={(value: string[]) => {
          const selectedValue = value[0]
          setInputValue(selectedValue as string)
          setOperatorValue(selectedValue !== 'between' ? 'all' : 'between')
          setBtnLabel(
            selectedValue === 'between'
              ? constructDateValuesText(dateValues)
              : `${selectedValue !== 'all' ? '' + selectedValue : 'All'}`,
          )
        }}
        placeholder="Select Period"
        style={styles.periodSelectorStyle}
        loading={loading}
      />

      {operatorValue === 'between' && renderDateCustomContent}
      {operatorValue === 'between' && dateValues.length < 3 && (
        <Button
          label="Add Date Range"
          size="small"
          onPress={setDateFilterValues}
          style={styles.addButton}
          backgroundColor={Colors.GREEN_DARK}
          iconSource={() => (
            <Icon
              name="add"
              size={16}
              color={Colors.WHITE}
              style={{ marginRight: 5 }}
            />
          )}
        />
      )}
    </View>
  )

  const byPeriodContent = (
    <View style={styles.selectorCard}>
      <Button
        label="Clear All"
        link
        onPress={() => {
          setBtnLabel('All')
          setOperatorValue('is')
          setInputValue('all')
          setDateValues([{ dateValueFrom: null, dateValueTo: null }])
        }}
        style={styles.clearButton}
        labelStyle={styles.clearButtonLabel}
        iconSource={() => (
          <Icon
            name="close-circle"
            size={16}
            color={Colors.RED}
            style={styles.clearIcon}
          />
        )}
      />

      <Text style={styles.periodTitle}>Select Period</Text>
      <CustomSelect
        mode="SINGLE"
        options={byPeriodFilterValues.map((p: any) => ({
          value: p.value,
          label: p.text,
        }))}
        value={inputValue || byPeriodFilterValues[0].value}
        onChange={(value: string[]) => {
          if (value && value.length > 0) {
            const selectedValue = value[0];
            setInputValue(selectedValue);
            setOperatorValue(selectedValue !== 'between' ? 'all' : 'between');
            setBtnLabel(
              selectedValue === 'between'
                ? constructDateValuesText(dateValues)
                : `${selectedValue !== 'all' ? '' + selectedValue : 'All'}`,
            );
          }
        }}
        placeholder="Select Period"
        style={styles.periodSelectorStyle}
      />
    </View>
  )

  const renderEditContent = useMemo(() => {
    if (props?.columnItem) {
      setLoading(false)
    }
    switch (props.columnItem.category) {
      case 'dimensions':
      case 'Smart Column':
      case 'calculated dimension':
        return dimensionsContent
      case 'flag':
        return flagContent
      case 'date':
        return dateContent
      case 'dateFilter':
        return forPeriodContent
      case 'by_period':
        return byPeriodContent
      case 'calculated metric':
      case 'metrics':
        return metricsContent
      default:
        return null
    }
  }, [
    props.columnItem?.category,
    select2Options,
    operatorValue,
    inputValue,
    inputValueNumber,
    inputValueNumberTo,
    dateValues,
    loading,
    globalFilter,
    globalFilterItems,
    newGlobalFilterName,
    isSingleValue,
  ])

  const filterEditHandler = () => {
    setEditOpen(true)
  }

  const isGuidedRuleVerify = (category: string, guidedRule: guidedRuleType) => {
    if (!guidedRule) return true
    if (category?.includes('date')) return !guidedRule?.hideDateFilter
    if (category?.includes('dimension')) return !guidedRule?.hideDimensionFilter
    if (category?.includes('metric')) return !guidedRule?.hideMetricFilter
    return true
  }

  const renderImprovedDatePicker = () => {
    // Get current date for validation
    const today = new Date();
    
    // Check if we have the current index set and if a date picker is showing
    const hasValidIndex = currentEditingDateIndex >= 0 && currentEditingDateIndex < dateValues.length;
    const isDatePickerShowing = showStartDatePicker || showEndDatePicker;
    
    // If we don't have a valid index, hide the picker
    if (!hasValidIndex && isDatePickerShowing) {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
      return null;
    }
    
    if (!isDatePickerShowing) {
      return null;
    }

    // Initialize with current month or the selected date's month if it exists
    const [currentMonth, setCurrentMonth] = useState(() => {
      if (hasValidIndex) {
        if (showStartDatePicker && dateValues[currentEditingDateIndex].dateValueFrom) {
          return new Date(dateValues[currentEditingDateIndex].dateValueFrom);
        } else if (showEndDatePicker && dateValues[currentEditingDateIndex].dateValueTo) {
          return new Date(dateValues[currentEditingDateIndex].dateValueTo);
        }
      }
      return new Date();
    });

    // Generate calendar days for the current month
    const generateCalendarDays = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      // Get first day of month and total days
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const daysInMonth = lastDayOfMonth.getDate();
      
      // Calculate days from previous month to show
      const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Generate array of day objects
      const days = [];
      
      // Add days from previous month if needed
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = 0; i < firstDayOfWeek; i++) {
        const dayNum = prevMonthLastDay - firstDayOfWeek + i + 1;
        days.push({
          day: dayNum,
          date: new Date(year, month - 1, dayNum),
          inCurrentMonth: false
        });
      }
      
      // Add days from current month
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({
          day: i,
          date: new Date(year, month, i),
          inCurrentMonth: true
        });
      }
      
      // Add days from next month if needed to fill out the grid
      const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;
      const remainingDays = totalCells - (firstDayOfWeek + daysInMonth);
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          day: i,
          date: new Date(year, month + 1, i),
          inCurrentMonth: false
        });
      }
      
      return days;
    };

    const calendarDays = generateCalendarDays();
    
    // Navigation between months
    const goToPreviousMonth = () => {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      setCurrentMonth(newMonth);
    };
    
    const goToNextMonth = () => {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      setCurrentMonth(newMonth);
    };

    // Format the current month for display
    const formatMonthYear = (date: Date) => {
      return format(date, 'MMMM yyyy');
    }

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!props.columnItem}
        onRequestClose={() => props.onClose()}
      >
        <View 
          style={styles.bottomSheetContent} 
          onStartShouldSetResponder={() => true}
        >
          {/* Bottom Sheet Handle */}
          <View style={styles.bottomSheetHandle} />
            
          {/* Calendar Header */}
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>
              {showStartDatePicker ? 'Select Start Date' : 'Select End Date'}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                setShowStartDatePicker(false);
                setShowEndDatePicker(false);
              }}
              style={styles.closeButton}
            >
              <Icon name="close-outline" size={24} color={Colors.GRAY_DARK} />
            </TouchableOpacity>
          </View>
              <TouchableOpacity 
                onPress={() => {
                  setShowStartDatePicker(false);
                  setShowEndDatePicker(false);
                }}
                style={styles.closeButton}
              >
                <Icon name="close-outline" size={24} color={Colors.GRAY_DARK} />
              </TouchableOpacity>
            </View>
        
        {/* Custom Calendar Date Picker */}
        <View style={styles.calendarPickerContainer}>
          {/* Month and Year Selector */}
          <View style={styles.monthYearSelector}>
            <TouchableOpacity
              onPress={() => {
                const currentDate = tempSelectedDate || 
                  (showStartDatePicker ? 
                    dateValues[currentEditingDateIndex]?.dateValueFrom : 
                    dateValues[currentEditingDateIndex]?.dateValueTo) || 
                  new Date();
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setTempSelectedDate(newDate);
              }}
            >
              <Icon name="chevron-back" size={24} color={Colors.GREEN_DARK} />
            </TouchableOpacity>
            
            <Text style={styles.monthYearText}>
              {format(tempSelectedDate || 
                (showStartDatePicker ? 
                  dateValues[currentEditingDateIndex]?.dateValueFrom || new Date() : 
                  dateValues[currentEditingDateIndex]?.dateValueTo || new Date()), 
                'MMMM yyyy')}
            </Text>
            
            <TouchableOpacity
              onPress={() => {
                const currentDate = tempSelectedDate || 
                  (showStartDatePicker ? 
                    dateValues[currentEditingDateIndex]?.dateValueFrom : 
                    dateValues[currentEditingDateIndex]?.dateValueTo) || 
                  new Date();
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setTempSelectedDate(newDate);
              }}
            >
              <Icon name="chevron-forward" size={24} color={Colors.GREEN_DARK} />
            </TouchableOpacity>
          </View>
          
          {/* Calendar Days */}
          <View style={styles.daysContainer}>
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={styles.dayHeader}>{day}</Text>
            ))}
            
            {/* Calendar Cells */}
            {generateCalendarDays().map((day, index) => {
              const isCurrentDate = showStartDatePicker ? 
                (dateValues[currentEditingDateIndex]?.dateValueFrom && 
                  day.date.getDate() === dateValues[currentEditingDateIndex].dateValueFrom.getDate() &&
                  day.date.getMonth() === dateValues[currentEditingDateIndex].dateValueFrom.getMonth() &&
                  day.date.getFullYear() === dateValues[currentEditingDateIndex].dateValueFrom.getFullYear()) :
                (dateValues[currentEditingDateIndex]?.dateValueTo &&
                  day.date.getDate() === dateValues[currentEditingDateIndex].dateValueTo.getDate() &&
                  day.date.getMonth() === dateValues[currentEditingDateIndex].dateValueTo.getMonth() &&
                  day.date.getFullYear() === dateValues[currentEditingDateIndex].dateValueTo.getFullYear());
                  
              const isFutureDate = day.date > today;
              
              const isValidEndDate = showEndDatePicker ? 
                dateValues[currentEditingDateIndex]?.dateValueFrom && 
                day.date >= dateValues[currentEditingDateIndex].dateValueFrom : true;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    !day.inCurrentMonth && styles.dayButtonDisabled,
                    (!isValidEndDate || isFutureDate) && styles.dayButtonDisabled,
                    isCurrentDate && styles.dayButtonSelected,
                  ]}
                  onPress={() => {
                    if (day.inCurrentMonth && (isValidEndDate || showStartDatePicker) && !isFutureDate) {
                      const dataVal = [...dateValues];
                      
                      if (showStartDatePicker) {
                        dataVal[currentEditingDateIndex].dateValueFrom = new Date(day.date);
                        // If end date is before new start date, clear it
                        if (dataVal[currentEditingDateIndex].dateValueTo && 
                            dataVal[currentEditingDateIndex].dateValueTo < day.date) {
                          dataVal[currentEditingDateIndex].dateValueTo = null;
                        }
                      } else {
                        dataVal[currentEditingDateIndex].dateValueTo = new Date(day.date);
                      }
                      
                      setDateValues(dataVal);
                      setBtnLabel(constructDateValuesText(dataVal));
                      
                      // Close picker after selection
                      if (showStartDatePicker) {
                        setShowStartDatePicker(false);
                        // If no end date is set, auto-open end date picker
                        if (!dataVal[currentEditingDateIndex].dateValueTo) {
                          setShowEndDatePicker(true);
                        }
                      } else {
                        setShowEndDatePicker(false);
                      }
                      
                      setTempSelectedDate(null);
                    }
                  }}
                  disabled={!day.inCurrentMonth || (!isValidEndDate && showEndDatePicker) || isFutureDate}
                >
                  <Text style={[
                    styles.dayButtonText,
                    (!day.inCurrentMonth || (!isValidEndDate && showEndDatePicker) || isFutureDate) && styles.dayButtonTextDisabled,
                    isCurrentDate && styles.dayButtonTextSelected,
                  ]}>
                    {day.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.dateConfirmButton}
          onPress={() => {
            setShowStartDatePicker(false);
            setShowEndDatePicker(false);
            setTempSelectedDate(null);
          }}
        >
          <Text style={styles.dateConfirmButtonText}>Done</Text>
        </TouchableOpacity>
      </Modal>
    );
  }}

// Proper navigation section for the calendar
const renderCalendarNavigation = (showStartDatePicker: boolean, dateValues: any[], currentEditingDateIndex: number, tempSelectedDate: Date | null, setTempSelectedDate: (date: Date) => void) => {
  return (
    <View style={styles.monthNavigationContainer}>
      <TouchableOpacity
        style={styles.monthNavigationButton}
        onPress={() => {
          const currentDate = (tempSelectedDate || 
            (showStartDatePicker ? 
              dateValues[currentEditingDateIndex]?.dateValueFrom : 
              dateValues[currentEditingDateIndex]?.dateValueTo) || 
            new Date());
          const newDate = new Date(currentDate);
          newDate.setMonth(newDate.getMonth() - 1);
          setTempSelectedDate(newDate);
        }}
      >
        <Icon name="chevron-back" size={24} color={Colors.GREEN_DARK} />
      </TouchableOpacity>
      
      <Text style={styles.monthYearText}>
        {format(tempSelectedDate || 
          (showStartDatePicker ? 
            dateValues[currentEditingDateIndex]?.dateValueFrom || new Date() : 
            dateValues[currentEditingDateIndex]?.dateValueTo || new Date()), 
          'MMMM yyyy')}
      </Text>

      <TouchableOpacity
        style={styles.monthNavigationButton}
        onPress={() => {
          const currentDate = (tempSelectedDate || 
            (showStartDatePicker ? 
              dateValues[currentEditingDateIndex]?.dateValueFrom : 
              dateValues[currentEditingDateIndex]?.dateValueTo) || 
            new Date());
          const newDate = new Date(currentDate);
          newDate.setMonth(newDate.getMonth() + 1);
          setTempSelectedDate(newDate);
        }}
      >
        <Icon name="chevron-forward" size={24} color={Colors.GREEN_DARK} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '90%',
    height: '70%',
    maxHeight: 600,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20
  },
  inlineDatePickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 
  },
  // Period filter styles
  periodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.blue50
  },
  periodSelectorStyle: {
    height: 40,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.blue30
  },
  periodSelectButton: {
    backgroundColor: Colors.blue10,
    borderRadius: 6,
    paddingVertical: 8
  },
  periodDropdownStyle: {
    borderColor: Colors.blue30,
    backgroundColor: Colors.blue5
  },
  periodSelectedItem: {
    backgroundColor: Colors.blue20
  },
  periodSearchInput: {
    borderColor: Colors.blue30
  },
  // Dataset filter styles
  datasetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.green5
  },
  datasetSelectorStyle: {
    height: 40,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.green30
  },
  datasetSelectButton: {
    backgroundColor: Colors.green10,
    borderRadius: 6,
    paddingVertical: 8
  },
  datasetDropdownStyle: {
    borderColor: Colors.green30,
    backgroundColor: Colors.green5
  },
  datasetSelectedItem: {
    backgroundColor: Colors.green20
  },
  datasetSearchInput: {
    borderColor: Colors.green30
  },
  // Column filter styles
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.red30
  },
  columnSelectorStyle: {
    height: 40,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.red20
  },
  columnSelectButton: {
    backgroundColor: Colors.red10,
    borderRadius: 6,
    paddingVertical: 8
  },
  columnDropdownStyle: {
    borderColor: Colors.red20,
    backgroundColor: Colors.red5
  },
  columnSelectedItem: {
    backgroundColor: Colors.red10
  },
  columnSearchInput: {
    borderColor: Colors.red20
  },
  // Calendar styles for date picker
  bottomSheetContent: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 16,
    marginTop: 50
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: Colors.GRAY_LIGHT,
    alignSelf: 'center',
    borderRadius: 3,
    marginBottom: 16
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.GREEN_DARK
  },
  closeButton: {
    padding: 5
  },
  calendarPickerContainer: {
    padding: 10
  },
  monthYearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  dayHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.GRAY_DARK
  },
  dayButtonDisabled: {
    opacity: 0.4
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  clearButtonLabel: {
    color: Colors.GREEN_DARK,
    marginRight: 5
  },
  clearIcon: {
    marginLeft: 5
  },
  dateRangeCard: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.LIGHT_GRAY,
    borderRadius: 8
  },
  dateRangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  dateRangeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.GREEN_DARK
  },
  removeIconButton: {
    padding: 5
  },
  dateRangeRow: {
    marginBottom: 10
  },
  datePickerContainer: {
    marginBottom: 12
  },
  datePickerLabel: {
    marginBottom: 6,
    color: Colors.GREEN_DARK,
    fontWeight: '500'
  },
  customDatePicker: {
    borderWidth: 1,
    borderColor: Colors.GREEN_LIGHT,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.WHITE
  },
  dateText: {
    color: Colors.GREEN_DARK
  },
  pickerInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  pickerText: {
    flex: 1,
    color: Colors.DARK_TEXT
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.DARK_TEXT
  },
  dimensionsContainer: {
    marginBottom: 20
  },
  selectorStyle: {
    marginBottom: 15
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15
  },
  dropdownStyle: {
    borderWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
    borderRadius: 8
  },
  selectedItem: {
    backgroundColor: Colors.LIGHT_GRAY
  },
  addButton: {
    backgroundColor: Colors.GREEN_DARK,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthNavigationButton: {
    padding: 5,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.GREEN_DARK,
  },
  weekdayHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekdayHeaderText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    color: Colors.GRAY_DARK,
  },
  calendarGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayButtonSelected: {
    backgroundColor: Colors.PRIMARY,
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
  },
  dayButtonInRange: {
    backgroundColor: Colors.LIGHT_PRIMARY,
  },
  dayButtonText: {
    fontSize: 14,
    color: Colors.BLACK,
  },
  dayButtonTextDisabled: {
    color: Colors.LIGHT_GRAYX,
  },
  dayButtonTextSelected: {
    color: Colors.WHITE,
    fontWeight: '600',
  },
  datePicker: {
    flex: 1,
  },
  datePickerInput: {
    borderWidth: 0,
    borderColor: Colors.GREEN_LIGHT,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.WHITE,
    color: Colors.GREEN_DARK,
  },
  addDateRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Colors.green5,
    borderRadius: 8,
    marginTop: 8,
  },
  addDateRangeText: {
    marginLeft: 8,
    color: Colors.white,
    fontWeight: '500',
  },
  label: {
    color: Colors.GREEN_DARK,
    marginRight: 10,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: Colors.green20,
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  editWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE_SMOKE,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: Colors.grey1,
    backgroundColor: Colors.WHITE,
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: '600',
    color: Colors.green1,
  },
  modalContent: {
    flex: 1,
    backgroundColor: Colors.WHITE_SMOKE,
  },
  modalContentContainer: {
    paddingBottom: 20,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: Colors.GREEN_LIGHT,
    backgroundColor: Colors.WHITE,
  },
  applyButton: {
    borderRadius: 8,
    height: 48,
  },
  picker: {
    height: 48,
    marginBottom: 15,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.GREEN_DARK,
  },
  closeButton: {
    padding: 4,
  },
  calendarPickerContainer: {
    marginVertical: 10,
  },
  monthYearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateConfirmButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  dateConfirmButtonText: {
    color: Colors.WHITE,
    fontWeight: 'bold',
    fontSize: 16,
  },
  monthNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  errorContainer: {
    backgroundColor: Colors.LIGHT_ERROR,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.ERROR,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorSubText: {
    color: Colors.ERROR,
    fontSize: 14,
  },
  fixedDatePickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inlineDatePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.green1,
  },
  pickerCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.grey40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectorCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: Colors.grey40,
  },
  selectorCard1: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: Colors.grey40,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  toggleLabel: {
    color: Colors.grey30,
    marginLeft: 8,
    fontWeight: '500',
  },
  toggleSwitch: {
    transform: [{ scaleX: 0.5 }, { scaleY: 0.5 }],
    marginLeft: 10,
    marginTop: 1,
  },
  customSelectButton: {
    backgroundColor: Colors.GREEN_DARK,
    borderRadius: 8,
    paddingVertical: 12,
  },
  dropdownStyle: {
    backgroundColor: Colors.WHITE,
    borderColor: Colors.GREEN_LIGHT,
    borderRadius: 8,
    marginTop: 5,
  },
  selectedItem: {
    backgroundColor: Colors.GREEN_LIGHT,
  },
  searchInput: {
    backgroundColor: Colors.WHITE,
    borderColor: Colors.GREEN_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  globalFilterCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: Colors.grey40,
  },
  globalFilterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 0,
  },
  globalFilterInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: 'transparent',
  },
})

export default FilterEditContent
