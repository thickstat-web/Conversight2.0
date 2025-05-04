import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native'
import {
  Button,
  Picker,
  TextField,
  Checkbox,
  DateTimePicker,
  Colors,
  Typography as UILTypography,
  Loader,
} from 'react-native-ui-lib'
import { format, parseISO } from 'date-fns'
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
import { UUID } from '@/Utils/common'
import { useConverseResponseMutation } from '@/Services/modules/ingress'
import CustomSelect from './CustomSelect'
import ColumnInfo from './ColumnInfo'

interface guidedRuleType {
  hideDateFilter?: boolean
  hideDimensionFilter?: boolean
  hideMetricFilter?: boolean
  hideClearMetricField?: boolean
  hideClearDimensionField?: boolean
  hideClearDateField?: boolean
}

interface Props {
  onClose: (value?: any) => void
  columnItem: any
  FilterItemSelectedValues: (value: any) => void
  inputLeftValue?: string
  inputRightValue?: string
  isTop?: boolean
  isSharedStoryBoard?: boolean
  guidedRule?: guidedRuleType
  setLoading: any
}

const FilterEditContent: React.FC<Props> = props => {
  const user = useAppSelector(selectProfile)
  const [editOpen, setEditOpen] = useState<boolean>(false)
  const [btnLabel, setBtnLabel] = useState<string>('All')
  let [select2Options, setSelect2Options] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [loadFailed, setLoadFailed] = useState<boolean>(false)
  const [operatorValue, setOperatorValue] = useState<string>('')
  const [inputValue, setInputValue] = useState<string[]>([])
  const [dateValues, setDateValues] = useState<any[]>([
    { dateValueFrom: null, dateValueTo: null },
  ])
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

  const onNameChange = (text: string) => {
    setNewGlobalFilterName(text)
  }

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
    props?.setLoading(true)
    const loadConfig = async () => {
      const configData =
        (await getLocalStore('conversight.dataset.config')) || {}
      setOperators(configData?.operators)
      setAggregationValues(configData?.aggregationValues)
      props?.setLoading(false)
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
        `${
          valueTemplate?.length && valueTemplate !== 'all'
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
        text += `${
          item.dateValueFrom ? format(item.dateValueFrom, 'MM/dd/yyyy') : ''
        } ${
          item.dateValueTo
            ? ' and ' + format(item.dateValueTo, 'MM/dd/yyyy')
            : ''
        }${index + 1 === dateValuesInfo.length ? '' : ' Vs '}`
      }
    })
    return text.trim()
  }

  const askAthena = async (UUID: string) => {
    props?.setLoading(true)

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
    if (response) {
      props?.setLoading(false)
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
    setLoading(true)
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
            <DateTimePicker
              mode="date"
              placeholder="Start date"
              value={p.dateValueFrom}
              onChange={(date: Date) => {
                const dataVal = [...dateValues]
                dataVal[index].dateValueFrom = date
                setDateValues(dataVal)
                setBtnLabel(constructDateValuesText(dataVal))
              }}
              dateFormat="MM/dd/yyyy"
              containerStyle={styles.datePicker}
              style={styles.datePickerInput}
            />
          </View>
          <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerLabel}>To</Text>
            <DateTimePicker
              mode="date"
              placeholder="End date"
              value={p.dateValueTo}
              onChange={(date: Date) => {
                const dataVal = [...dateValues]
                dataVal[index].dateValueTo = date
                setDateValues(dataVal)
                setBtnLabel(constructDateValuesText(dataVal))
              }}
              dateFormat="MM/dd/yyyy"
              containerStyle={styles.datePicker}
              style={styles.datePickerInput}
            />
          </View>
        </View>
      </View>
    ))
  }, [dateValues])

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
            setInputValue(undefined)
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
              ? `between ${inputValueNumber || ''} ${
                  inputValueNumberTo ? ' and ' + inputValueNumberTo : ''
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
            `${operatorValue} ${text} ${
              inputValueNumberTo ? ' and ' + inputValueNumberTo : ''
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
              `${
                inputValueNumber
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
    <Loader message="Applying Security..." />
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
          setInputValue([])
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
          setInputValue([])
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
            setInputValue(undefined)
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
    <Loader message="Applying Security..." />
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
            setInputValue([])
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
            setInputValue([])
            setOperatorValue(value[0])
            setBtnLabel(value[0]?.length ? `${value[0]} All` : 'All')
          }}
          placeholder="Select Operator"
          style={styles.selectorStyle}
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
          />
        ) : (
          <TextField
            placeholder="Enter filter value"
            value={
              inputValue?.[0]?.includes('@@')
                ? inputValue?.[0]?.split('@@')[1]?.trim()
                : inputValue
            }
            onChangeText={(text: string | any[]) => {
              setInputValue([text])
              setBtnLabel(text.length ? `${operatorValue} ${text}` : 'All')
            }}
            style={styles.textInput}
            underlineColor={Colors.green1}
            focusOnLayout={true}
            placeholderTextColor={Colors.grey30}
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
            setInputValue(undefined)
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
        <Text style={styles.sectionTitle}>Select Period</Text>
        <CustomSelect
          mode="SINGLE"
          options={reportPeriodsValues.map((p: any) => ({
            value: p.value,
            label: p.text,
          }))}
          value={inputValue ? [inputValue] : [reportPeriodsValues[0].value]}
          onChange={(value: string[]) => {
            const selectedValue = value[0]
            setInputValue(selectedValue)
            setOperatorValue(selectedValue !== 'between' ? 'is' : 'between')
            setBtnLabel(
              selectedValue === 'between'
                ? constructDateValuesText(dateValues)
                : `${selectedValue !== 'all' ? 'is ' + selectedValue : 'All'}`,
            )
          }}
          placeholder="Select Period"
          style={styles.selectorStyle}
          checkboxColor={Colors.GREEN_DARK}
          buttonStyle={styles.customSelectButton}
          dropdownStyle={styles.dropdownStyle}
          selectedItemStyle={styles.selectedItem}
          searchInputStyle={styles.searchInput}
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

      <Text style={styles.sectionTitle}>Select Period</Text>
      <CustomSelect
        mode="SINGLE"
        options={reportPeriodsValues.map((p: any) => ({
          value: p.value,
          label: p.text,
        }))}
        value={inputValue ? [inputValue] : [reportPeriodsValues[0].value]}
        onChange={(value: string[]) => {
          const selectedValue = value[0]
          setInputValue(selectedValue)
          setOperatorValue(selectedValue !== 'between' ? 'all' : 'between')
          setBtnLabel(
            selectedValue === 'between'
              ? constructDateValuesText(dateValues)
              : `${selectedValue !== 'all' ? '' + selectedValue : 'All'}`,
          )
        }}
        placeholder="Select Period"
        style={styles.selectorStyle}
        checkboxColor={Colors.GREEN_DARK}
        buttonStyle={styles.customSelectButton}
        dropdownStyle={styles.dropdownStyle}
        selectedItemStyle={styles.selectedItem}
        searchInputStyle={styles.searchInput}
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

      <Text style={styles.sectionTitle}>Select Period</Text>
      <CustomSelect
        mode="SINGLE"
        options={byPeriodFilterValues.map((p: any) => ({
          value: p.value,
          label: p.text,
        }))}
        value={inputValue ? [inputValue] : [byPeriodFilterValues[0].value]}
        onChange={(value: string[]) => {
          const selectedValue = value[0]
          setInputValue(selectedValue)
          setOperatorValue(selectedValue !== 'between' ? 'all' : 'between')
          setBtnLabel(
            selectedValue === 'between'
              ? constructDateValuesText(dateValues)
              : `${selectedValue !== 'all' ? '' + selectedValue : 'All'}`,
          )
        }}
        placeholder="Select Period"
        style={styles.selectorStyle}
        checkboxColor={Colors.GREEN_DARK}
        buttonStyle={styles.customSelectButton}
        dropdownStyle={styles.dropdownStyle}
        selectedItemStyle={styles.selectedItem}
        searchInputStyle={styles.searchInput}
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

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={filterEditHandler}>
        <Text style={styles.label}>
          {props.columnItem?.vocabulary?.[0] ||
            props.columnItem?.label ||
            props.columnItem?.processedID}
        </Text>
      </TouchableOpacity>
      {props.columnItem.is_editable &&
        isGuidedRuleVerify(
          props?.columnItem.category.toLowerCase(),
          props?.guidedRule,
        ) && (
          <View style={styles.editWrapper}>
            <Button
              label={btnLabel}
              size="small"
              onPress={filterEditHandler}
              style={styles.editButton}
              labelStyle={{ color: Colors.GREEN_MAIN }}
            />
            <Modal
              visible={editOpen}
              animationType="slide"
              transparent={false}
              onRequestClose={() => setEditOpen(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {props.columnItem?.vocabulary?.[0] ||
                      props.columnItem?.label ||
                      props.columnItem?.processedID}
                  </Text>
                  <Button
                    iconSource={() => (
                      <Icon name="close" size={24} color={Colors.GREEN_DARK} />
                    )}
                    size="small"
                    onPress={() => setEditOpen(false)}
                    style={styles.closeButton}
                  />
                </View>

                <ScrollView
                  style={styles.modalContent}
                  contentContainerStyle={styles.modalContentContainer}
                >
                  {renderEditContent}

                  {!props?.isSharedStoryBoard && (
                    <View style={styles.globalFilterCard}>
                      <Text style={styles.sectionTitle}>
                        Save as Global Filter
                      </Text>
                      <View style={styles.globalFilterToggle}>
                        <Switch
                          value={globalFilter.enabled}
                          onValueChange={value =>
                            setGlobalFilter({ ...globalFilter, enabled: value })
                          }
                          trackColor={{
                            false: Colors.GREY,
                            true: Colors.GREEN_DARK,
                          }}
                          thumbColor={Colors.WHITE}
                        />
                        <Text style={styles.toggleLabel}>
                          Enable Global Filter
                        </Text>
                      </View>

                      {globalFilter.enabled && (
                        <View style={styles.globalFilterInput}>
                          <TextField
                            placeholder="Filter name"
                            value={newGlobalFilterName}
                            onChangeText={onNameChange}
                            style={styles.textInput1}
                            underlineColor={Colors.green1}
                            focusOnLayout={true}
                          />
                          <Button
                            label="Add"
                            size="small"
                            onPress={addItem}
                            style={styles.addButton}
                            backgroundColor={Colors.green5}
                          />
                        </View>
                      )}
                    </View>
                  )}
                </ScrollView>

                <View style={styles.modalFooter}>
                  <Button
                    label="Apply Filters"
                    size="medium"
                    onPress={() => setEditOpen(false)}
                    backgroundColor={Colors.green5}
                    style={styles.applyButton}
                  />
                </View>
              </View>
            </Modal>
          </View>
        )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderColor: Colors.GREEN_LIGHT,
  },
  dateRangeCard: {
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
  dateRangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateRangeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.GREEN_DARK,
  },
  removeIconButton: {
    padding: 4,
  },
  dateRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePickerContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  datePickerLabel: {
    fontSize: 14,
    color: Colors.grey30,
    marginBottom: 4,
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
  pickerInnerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  pickerText: {
    color: Colors.GREEN_DARK,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.GREEN_LIGHT,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.WHITE,
    color: Colors.GREEN_DARK,
    marginBottom: 1,
  },
  textInput1: {
    borderWidth: 1,
    borderColor: Colors.black,
    borderRadius: 8,
    padding: 5,
    width: '70%',
    backgroundColor: Colors.WHITE,
    color: Colors.green1,
    marginTop: 25,
    marginBottom: 0,
  },
  addButton: {
    marginBottom: 10,
    borderRadius: 8,
    height: 38,
    marginLeft: 10,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.RED,
    marginVertical: 10,
    textAlign: 'center',
  },
  selectorStyle: {
    backgroundColor: Colors.WHITE,
    borderColor: Colors.GREEN_LIGHT,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorSubText: {
    ...UILTypography.text90,
    color: Colors.grey20,
    marginBottom: 10,
    textAlign: 'center',
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    paddingVertical: 5,
  },
  clearButtonLabel: {
    color: Colors.red1,
    fontWeight: '500',
  },
  clearIcon: {
    marginRight: 5,
    color: Colors.red1,
  },
  dimensionsContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
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
