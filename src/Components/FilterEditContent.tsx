import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import {
  Button,
  Picker,
  TextField,
  Checkbox,
  DateTimePicker,
  Colors,
  Typography as UILTypography,
  Loader,
} from 'react-native-ui-lib';
import { format, parseISO } from 'date-fns';
import Icon from 'react-native-vector-icons/Ionicons';
import isArray from 'lodash/isArray';
import orderBy from 'lodash/orderBy';
import toNumber from 'lodash/toNumber';
import { getLocalStore, setLocalStore } from '@/Utils/asyncStorage';
import { reportPeriodsValues, byPeriodFilterValues } from '@/Constants/reportPeriodsValues';
import { useAppSelector } from '@/Hooks';
import { selectProfile } from '@/Store/Settings';
import { UUID } from '@/Utils/common';
import { useConverseResponseMutation } from '@/Services/modules/ingress';
import CustomSelect from './CustomSelect';
import ColumnInfo from './ColumnInfo';



interface guidedRuleType {
  hideDateFilter?: boolean;
  hideDimensionFilter?: boolean;
  hideMetricFilter?: boolean;
  hideClearMetricField?: boolean;
  hideClearDimensionField?: boolean;
  hideClearDateField?: boolean;
}

interface Props {
  onClose: (value?: any) => void;
  columnItem: any;
  FilterItemSelectedValues: (value: any) => void;
  inputLeftValue?: string;
  inputRightValue?: string;
  isTop?: boolean;
  isSharedStoryBoard?: boolean;
  guidedRule?: guidedRuleType;
  setLoading: any
}


const FilterEditContent: React.FC<Props> = (props) => {
  const user = useAppSelector(selectProfile);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [btnLabel, setBtnLabel] = useState<string>('All');
  let [select2Options, setSelect2Options] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadFailed, setLoadFailed] = useState<boolean>(false);
  const [operatorValue, setOperatorValue] = useState<string>('');
  const [inputValue, setInputValue] = useState<string[]>([]);
  const [dateValues, setDateValues] = useState<any[]>([{ dateValueFrom: null, dateValueTo: null }]);
  const [inputValueNumber, setInputValueNumber] = useState<number | string | null>(null);
  const [inputValueNumberTo, setInputValueNumberTo] = useState<number | string | null>(null);
  const [isSingleValue, setIsSingleValue] = useState(false);
  const [globalFilterItems, setGlobalFilterItems] = useState<any[]>([]);
  const [newGlobalFilterName, setNewGlobalFilterName] = useState('');
  const [globalFilter, setGlobalFilter] = useState({ enabled: false, name: '' });
  const inputRef = useRef<any>(null);

  const [operators, setOperators] = useState<any>({})
  const [aggregationValues, setAggregationValues] = useState<any>({})
  const [converseResponse, { data, error, isLoading }] = useConverseResponseMutation();


  const onNameChange = (text: string) => {
    setNewGlobalFilterName(text);
  };

  const addItem = () => {
    if (newGlobalFilterName) {
      setGlobalFilterItems([...globalFilterItems, newGlobalFilterName]);
      setNewGlobalFilterName('');
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    const key = `conversight.${user?.orgId}.${user?.email?.replace?.(/[.]/g, '@')}.dashboard.gbFilters`;

    const initializeFilters = async () => {
      const defaultFilters = ['Filter A', 'Filter B'];
      await setLocalStore(key, defaultFilters);
      const storedItems = await getLocalStore(key);
      setGlobalFilterItems(storedItems);
    };
    if (user?.orgId && user?.email) {
      initializeFilters();
    }
  }, [user]);


  useEffect(() => {
    props?.setLoading(true)
    const loadConfig = async () => {
      const configData = await getLocalStore('conversight.dataset.config') || {};
      setOperators(configData?.operators)
      setAggregationValues(configData?.aggregationValues)
      props?.setLoading(false)
    };
    loadConfig();
  }, []);

  useEffect(() => {
    setLocalStore(
      `conversight.${user?.orgId}.${user?.email?.replace?.(/[.]/g, '@')}.dashboard.gbFilters`,
      globalFilterItems
    );
  }, [globalFilterItems]);

  useEffect(() => {
    if (
      ['dimensions', 'Smart Column', 'calculated dimension', 'flag'].includes(props.columnItem.category) &&
      props.columnItem.is_editable &&
      editOpen &&
      !props?.columnItem?.isAggregation &&
      !select2Options?.length
    ) {
      askAthena(UUID());
    }
  }, [editOpen]);


  useEffect(() => {
    if (props?.columnItem && !props?.columnItem?.editedContent) {
      let operator = props?.columnItem?.operator;
      let value = isArray(props?.columnItem?.value)
        ? props?.columnItem?.value.map((valueItem: any) => valueItem.id + '@@' + valueItem.name)
        : props?.columnItem?.value;

      if (['dimensions', 'Smart Column', 'calculated dimension'].includes(props.columnItem.category)) {
        operator = operator || operators?.dimensions?.[0]?.id;
        value = value || [];
      } else if (props.columnItem.category === 'metrics') {
        operator = operator || operators?.metrics?.[0]?.id;
      } else if (props.columnItem.category === 'date') {
        operator = props?.columnItem?.isAggregation ? '' : operator || 'is';
        value = value || reportPeriodsValues[0].value;
      } else if (props.columnItem.category === 'flag') {
        operator = operator || '=';
      }

      setGlobalFilter(props?.columnItem?.globalFilter || { ...globalFilter });

      const dateValuesArray = props?.columnItem?.dateValues?.length
        ? props?.columnItem?.dateValues.map((data: any) => ({
          dateValueFrom: data.dateValueFrom ? parseISO(data.dateValueFrom) : null,
          dateValueTo: data.dateValueTo ? parseISO(data.dateValueTo) : null,
        }))
        : [{ dateValueFrom: null, dateValueTo: null }];

      setDateValues(dateValuesArray);
      setOperatorValue(operator || 'is');
      setInputValue(value);

      const valueTemplate =
        props?.columnItem?.dateValues?.length
          ? constructDateValuesText(dateValuesArray)
          : value?.[0]?.includes('@@')
            ? value?.map((valueItem: any) => valueItem?.split?.('@@')?.[1])?.join?.(', ')
            : value?.join?.(', ') || value;

      setBtnLabel(
        `${valueTemplate?.length && valueTemplate !== 'all'
          ? props?.columnItem?.dateValues?.length
            ? valueTemplate
            : operator + ' ' + valueTemplate
          : 'All'
        }`
      );
      setIsSingleValue(props?.columnItem?.isSingleValue);
    } else {
      setOperatorValue(props?.columnItem?.editedContent?.operatorValue);
      setInputValue(props?.columnItem?.editedContent?.inputValue);
      setDateValues(
        props?.columnItem?.editedContent?.dateValues?.length
          ? props?.columnItem?.editedContent?.dateValues.map((data: any) => ({
            dateValueFrom: data.dateValueFrom ? parseISO(data.dateValueFrom) : null,
            dateValueTo: data.dateValueTo ? parseISO(data.dateValueTo) : null,
          }))
          : [{ dateValueFrom: null, dateValueTo: null }]
      );
      setBtnLabel(props?.columnItem?.editedContent?.btnLabel);
      setIsSingleValue(props?.columnItem?.editedContent?.isSingleValue);
    }
  }, [props?.columnItem]);

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
    });
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
  ]);

  const constructDateValuesText = (dateValuesInfo: any) => {
    let text = 'between ';
    dateValuesInfo.forEach((item: any, index: number) => {
      if (item.dateValueFrom && item.dateValueTo) {
        text +=
          `${item.dateValueFrom ? format(item.dateValueFrom, 'MM/dd/yyyy') : ''} ${item.dateValueTo ? ' and ' + format(item.dateValueTo, 'MM/dd/yyyy') : ''
          }${index + 1 === dateValuesInfo.length ? '' : ' Vs '}`;
      }
    });
    return text.trim();
  };


  const askAthena = async (UUID: string) => {
    props?.setLoading(true)

    const requestPayload: any = {
      session: {
        message: {
          text: props.columnItem.processedID,
          displayUtterance: "",
          domain: "",
          dataSet: props.columnItem.data_set,
          filter: [],
          qtype: "addfilter",
          context: ""
        },
        options: {
          transform: true,
          freeForm: false,
          mode: "",
          channel: "chat",
          source: "mobile",
          record: false,
          timezone: new Date().getTimezoneOffset().toString(),
          responseType: "instruction"
        }
      }
    };


    const response: any = await converseResponse(requestPayload).unwrap();
    if (response) {
      props?.setLoading(false)
      const firstItem = response?.data[0];
      if (firstItem) {
        delete firstItem.__id;
        const ojbKey = Object.keys(firstItem)[0];
        const ojbKey2 = Object.keys(firstItem)[1];
        setSelect2Options(
          response.data.map((item: any) => ({
            id: item[ojbKey],
            name: item[ojbKey2] || item[ojbKey],
            tooltip: ojbKey2,
          }))
        );
      }
    }
    setLoading(true);
  };

  const setDateFilterValues = () => {
    setDateValues([...dateValues, { dateValueFrom: null, dateValueTo: null }]);
  };

  const removeAddedDate = (index: number) => {
    const dateValuesCopy = [...dateValues];
    dateValuesCopy.splice(index, 1);
    setDateValues(dateValuesCopy);
    setBtnLabel(constructDateValuesText(dateValuesCopy));
  };


  const ErrorMsg = () => (
    <View style={styles.errorContainer}>
      <Icon name="closecircle" size={40} color={Colors.red30} />
      <Text style={styles.errorText}>There are some problems fetching the values.</Text>
      <Text style={styles.errorSubText}>This has been notified to the technical team.</Text>
      <Button
        label="Try again"
        size="small"
        onPress={() => {
          setLoading(true);
          setLoadFailed(false);
          askAthena(UUID());
        }}
        iconSource={() => <Icon name="reload1" size={16} style={{ marginRight: 5 }} />}
      />
    </View>
  );

  const renderDateCustomContent = useMemo(() => {
    return dateValues.map((p: any, index: number) => (
      <View key={`iterator_d_picker_${index}`} style={styles.datePickerWrapper}>
        {dateValues.length > 1 && (
          <Button
            label="Remove"
            size="small"
            onPress={() => removeAddedDate(index)}
            style={styles.removeButton}
          />
        )}
        <DateTimePicker
          mode="date"
          placeholder="From"
          value={p.dateValueFrom}
          onChange={(date: Date) => {
            const dataVal = [...dateValues];
            dataVal[index].dateValueFrom = date;
            setDateValues(dataVal);
            setBtnLabel(constructDateValuesText(dataVal));
          }}
          dateFormat="MM/dd/yyyy"
          containerStyle={styles.datePicker}
        />
        <DateTimePicker
          mode="date"
          placeholder="To"
          value={p.dateValueTo}
          onChange={(date: Date) => {
            const dataVal = [...dateValues];
            dataVal[index].dateValueTo = date;
            setDateValues(dataVal);
            setBtnLabel(constructDateValuesText(dataVal));
          }}
          dateFormat="MM/dd/yyyy"
          containerStyle={styles.datePicker}
        />
      </View>
    ));
  }, [dateValues]);

  const SelectOptionMemo = useMemo(() => {
    const checkDataType = !toNumber(select2Options[0]?.name);
    if (checkDataType) {
      select2Options = orderBy(select2Options, ['name'], ['asc']);
    }
    return select2Options.map((opt: any) => ({
      value: opt.id + '@@' + opt.name,
      label: opt.name,
    }));
  }, [select2Options]);

  const metricsContent = props?.columnItem?.isAggregation ? (
    <View>
      {!props?.guidedRule?.hideClearMetricField && (
        <Button
          label="Clear"
          link
          onPress={() => {
            setBtnLabel('All');
            setInputValue(undefined);
          }}
          style={styles.clearButton}
        />
      )}
      <Picker
        placeholder="Select"
        value={inputValue}
        onChange={(value: any) => {
          setInputValue(value);
          setBtnLabel(value);
        }}
        style={styles.picker}
      >
        {aggregationValues?.metrics?.map((o: any, i: number) => (
          <Picker.Item key={`agg_metrics_${i}`} value={o.id} label={o.name} />
        ))}
      </Picker>
    </View>
  ) : (
    <View>
      <Button
        label="Clear"
        link
        onPress={() => {
          setBtnLabel('All');
          setOperatorValue(operators?.metrics?.[0]?.id);
          setInputValueNumber('');
          setInputValueNumberTo('');
        }}
        style={styles.clearButton}
      />
      <Picker
        placeholder="Select"
        value={operatorValue}
        onChange={(value: any) => {
          setOperatorValue(value);
          setBtnLabel(
            value === 'between'
              ? `between ${inputValueNumber || ''} ${inputValueNumberTo ? ' and ' + inputValueNumberTo : ''}`
              : `${value + ' ' + inputValueNumber}`
          );
        }}
        style={styles.picker}
      >
        {operators?.metrics?.map((o: any, i: number) => (
          <Picker.Item key={`operators_${i}`} value={o.id} label={o.id} />
        ))}
      </Picker>
      <TextField
        placeholder={operatorValue !== 'between' ? 'Value' : 'From'}
        value={inputValueNumber?.toString()}
        onChangeText={(text: React.SetStateAction<string | number | null>) => {
          setInputValueNumber(text);
          setBtnLabel(`${operatorValue} ${text} ${inputValueNumberTo ? ' and ' + inputValueNumberTo : ''}`);
        }}
        keyboardType="numeric"
        style={styles.input}
      />
      {operatorValue === 'between' && (
        <TextField
          placeholder="To"
          value={inputValueNumberTo?.toString()}
          onChangeText={(text: React.SetStateAction<string | number | null>) => {
            setInputValueNumberTo(text);
            setBtnLabel(`${inputValueNumber ? `${operatorValue} ${inputValueNumber} and ${text}` : operatorValue}`);
          }}
          keyboardType="numeric"
          style={styles.input}
        />
      )}
    </View>
  );

  const flagContent = loading ? (
    <Loader message="Applying Security..." />
  ) : loadFailed ? (
    <ErrorMsg />
  ) : (
    <View>
      <Button
        label="Clear"
        link
        onPress={() => {
          setBtnLabel('All');
          setOperatorValue('');
          setInputValue([]);
        }}
        style={styles.clearButton}
      />
      <Picker
        placeholder="Select"
        value={operatorValue || operators?.dimensions?.[0]?.id}
        onChange={(value: any) => {
          setInputValue([]);
          setOperatorValue(value);
          setBtnLabel(value.length ? `${value} All` : 'All');
        }}
        disabled={!operators?.dimensions?.length}
        style={styles.picker}
      >
        {operators?.flag?.map((o: any, i: number) => (
          <Picker.Item key={`filter_dim_${i}`} value={o.id} label={o.name} />
        ))}
      </Picker>
      <Picker
        placeholder="Select"
        value={inputValue}
        onChange={(value: any) => {
          const displayVal = value.includes('@@') ? value.split('@@')[1]?.trim() : value;
          setInputValue(displayVal);
          setBtnLabel(value.length ? `${operatorValue} ${displayVal}` : 'All');
        }}
        disabled={!select2Options.length}
        style={styles.picker}
      >
        {SelectOptionMemo.map((opt) => (
          <Picker.Item key={opt.value} value={opt.value} label={opt.label} />
        ))}
      </Picker>
    </View>
  );

  const dimensionsContent = props?.columnItem?.isAggregation ? (
    <View>
      {!props?.guidedRule?.hideClearDimensionField && (
        <Button
          label="Clear"
          link
          onPress={() => {
            setBtnLabel('All');
            setInputValue(undefined);
          }}
          style={styles.clearButton}
        />
      )}
      <Picker
        placeholder="Select"
        value={inputValue}
        onChange={(value: any) => {
          setInputValue(value);
          setBtnLabel(value);
        }}
        style={styles.picker}
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
    <View>
      <View style={styles.checkboxWrapper}>
        <Checkbox
          value={!isSingleValue}
          onValueChange={(value: any) => {
            setIsSingleValue(!value);
            if (inputValue?.length) {
              const displayVal = inputValue[0].includes('@@')
                ? inputValue[0].split('@@')[1]?.trim()
                : inputValue[0];
              setBtnLabel(`${operatorValue} ${displayVal}`);
              setInputValue([inputValue[0]]);
            }
          }}
          label="Multi Select"
        />
        <Button
          label="Clear"
          link
          onPress={() => {
            setBtnLabel('All');
            setOperatorValue('');
            setInputValue([]);
          }}
          style={styles.clearButton}
        />
      </View>
      <Picker
        placeholder="Select"
        value={operatorValue || operators?.dimensions?.[0]?.id}
        onChange={(value: any) => {
          setInputValue([]);
          setOperatorValue(value);
          setBtnLabel(value.length ? `${value} All` : 'All');
        }}
        disabled={!operators?.dimensions?.length}
        style={styles.picker}
      >
        {operators?.dimensions?.map((o: any, i: number) => (
          <Picker.Item key={`filter_dim_${i}`} value={o.id} label={o.name} />
        ))}
      </Picker>
      {operatorValue !== 'like' && operatorValue !== 'not like' ? (
        <CustomSelect
          mode={isSingleValue ? 'SINGLE' : 'MULTI'}
          options={SelectOptionMemo}
          value={Array.isArray(inputValue) ? inputValue : [inputValue]}
          onChange={(val) => {
            setInputValue(val);
            const displayVal = val.map((valueItem: any) =>
              typeof valueItem === 'string' && valueItem.includes('@@')
                ? valueItem.split('@@')[1]?.trim()
                : String(valueItem)
            );
            const opVal = typeof operatorValue === 'string'
              ? operatorValue
              : operatorValue?.value || '';
            setBtnLabel(val.length ? `${opVal} ${displayVal.join(', ')}` : 'All');
          }}
          selectorStyle={{
            backgroundColor: Colors.WHITE_SMOKE,
          }}
          checkboxColor={Colors.GREEN_DARK}
          buttonStyle={{
            backgroundColor: Colors.GREEN_DARK,
          }}
        />
      ) : (
        <TextField
          placeholder="Enter value"
          value={
            inputValue?.[0]?.includes('@@')
              ? inputValue?.[0]?.split('@@')[1]?.trim()
              : inputValue
          }
          onChangeText={(text: string | any[]) => {
            setInputValue([text]);
            setBtnLabel(text.length ? `${operatorValue} ${text}` : 'All');
          }}
          style={styles.input}
        />
      )}
    </View>
  );

  const dateContent = props?.columnItem?.isAggregation ? (
    <View>
      {!props?.guidedRule?.hideClearDateField && (
        <Button
          label="Clear"
          link
          onPress={() => {
            setBtnLabel('All');
            setInputValue(undefined);
          }}
          style={styles.clearButton}
        />
      )}
      <Picker
        placeholder="Select"
        value={inputValue || reportPeriodsValues[0]?.value || 'all'}
        onChange={(value: any) => {
          setInputValue(value);
          setBtnLabel(value);
        }}
        style={styles.picker}
      >
        {aggregationValues?.date?.map((o: any, i: number) => (
          <Picker.Item key={`agg_date_${i}`} value={o.id} label={o.name} />
        ))}
      </Picker>
    </View>
  ) : (
    <View>
      <Button
        label="Clear"
        link
        onPress={() => {
          setBtnLabel('All');
          setOperatorValue('is');
          setInputValue('all');
          setDateValues([{ dateValueFrom: null, dateValueTo: null }]);
        }}
        style={styles.clearButton}
      />
      <Picker
        placeholder="Select"
        value={inputValue || reportPeriodsValues[0].value}
        onChange={(value: any) => {
          const selectedValue = value.value;
          setInputValue(selectedValue);
          setOperatorValue(selectedValue !== 'between' ? 'is' : 'between');
          setBtnLabel(
            selectedValue === 'between'
              ? constructDateValuesText(dateValues)
              : `${selectedValue !== 'all' ? 'is ' + selectedValue : 'All'}`
          );
        }}
        style={styles.picker}
      >
        {reportPeriodsValues.map((p: any, index: number) => (
          <Picker.Item
            key={`report_period_${p.value}_${index}`}
            value={p.value}
            label={p.text}
          />
        ))}
      </Picker>
      {operatorValue === 'between' && renderDateCustomContent}
      {operatorValue === 'between' && dateValues.length < 3 && (
        <Button
          label="Add"
          size="small"
          onPress={setDateFilterValues}
          style={styles.addButton}
        />
      )}
    </View>
  );

  const forPeriodContent = (
    <View>
      <Button
        label="Clear"
        link
        onPress={() => {
          setBtnLabel('All');
          setOperatorValue('is');
          setInputValue('all');
          setDateValues([{ dateValueFrom: null, dateValueTo: null }]);
        }}
        style={styles.clearButton}
      />
      <Picker
        placeholder="Select"
        value={inputValue || reportPeriodsValues[0].value}
        onChange={(value: any) => {
          const selectedValue = value.value;
          setInputValue(selectedValue);
          setOperatorValue(selectedValue !== 'between' ? 'all' : 'between');
          setBtnLabel(
            selectedValue === 'between'
              ? constructDateValuesText(dateValues)
              : `${selectedValue !== 'all' ? '' + selectedValue : 'All'}`
          );
        }}
        style={styles.picker}
      >
        {reportPeriodsValues.map((p: any, index: number) => (
          <Picker.Item
            key={`report_period_${p.value}_${index}`}
            value={p.value}
            label={p.text}
          />
        ))}
      </Picker>
      {operatorValue === 'between' && renderDateCustomContent}
      {operatorValue === 'between' && dateValues.length < 3 && (
        <Button
          label="Add"
          size="small"
          onPress={setDateFilterValues}
          style={styles.addButton}
        />
      )}
    </View>
  );

  const byPeriodContent = (
    <View>
      <Button
        label="Clear"
        link
        onPress={() => {
          setBtnLabel('All');
          setOperatorValue('is');
          setInputValue('all');
          setDateValues([{ dateValueFrom: null, dateValueTo: null }]);
        }}
        style={styles.clearButton}
      />
      <Picker
        placeholder="Select"
        value={inputValue || byPeriodFilterValues[0].value}
        onChange={(value: any) => {
          const selectedValue = value.value;
          setInputValue(selectedValue);
          setOperatorValue(selectedValue !== 'between' ? 'all' : 'between');
          setBtnLabel(
            selectedValue === 'between'
              ? constructDateValuesText(dateValues)
              : `${selectedValue !== 'all' ? '' + selectedValue : 'All'}`
          );
        }}
        style={styles.picker}
      >
        {byPeriodFilterValues.map((p: any, index: number) => (
          <Picker.Item
            key={`report_period_${p.value}_${index}`}
            value={p.value}
            label={p.text}
          />
        ))}
      </Picker>
    </View>
  );
  const renderEditContent = useMemo(() => {
    if (props?.columnItem) {
      setLoading(false)
    }
    switch (props.columnItem.category) {
      case 'dimensions':
      case 'Smart Column':
      case 'calculated dimension':
        return dimensionsContent;
      case 'flag':
        return flagContent;
      case 'date':
        return dateContent;
      case 'dateFilter':
        return forPeriodContent;
      case 'by_period':
        return byPeriodContent;
      case 'calculated metric':
      case 'metrics':
        return metricsContent;
      default:
        return null;
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
  ]);

  const filterEditHandler = () => {
    setEditOpen(true);
  };

  const isGuidedRuleVerify = (category: string, guidedRule: guidedRuleType) => {
    if (!guidedRule) return true;
    if (category?.includes('date')) return !guidedRule?.hideDateFilter;
    if (category?.includes('dimension')) return !guidedRule?.hideDimensionFilter;
    if (category?.includes('metric')) return !guidedRule?.hideMetricFilter;
    return true;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={filterEditHandler}>
        <Text style={styles.label}>
          {props.columnItem?.vocabulary?.[0] || props.columnItem?.label || props.columnItem?.processedID}
        </Text>
      </TouchableOpacity>
      {props.columnItem.is_editable && isGuidedRuleVerify(props?.columnItem.category.toLowerCase(), props?.guidedRule) && (
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
                <Text style={styles.modalTitle}>Filter Options</Text>
                <Button
                  iconSource={() => <Icon name="close" size={24} />}
                  size="small"
                  onPress={() => setEditOpen(false)}
                  style={styles.closeButton}
                />
              </View>
              <ScrollView style={styles.modalContent}>
                {renderEditContent}
              </ScrollView>
            </View>
          </Modal>
        </View>
      )}
      {!editOpen && !props.columnItem?.hideClose && (
        <Button
          iconSource={() => <Icon name="close" size={20} />}
          size="small"
          onPress={props.onClose}
          style={styles.closeButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderColor: Colors.GREEN_DARK,
  },
  label: {
    color: Colors.GREEN_DARK,
    marginRight: 10,
  },
  editButton: {
    backgroundColor: Colors.green20,
  },
  modalContainer: {
    paddingTop: 50,
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: Colors.GREEN_DARK,
  },
  modalTitle: {
    color: Colors.GREEN_DARK,
  },
  picker: {
    height: 40,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.GREEN_DARK,
    borderRadius: 5,
  },
  input: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.GREEN_DARK,
    borderRadius: 5,
    padding: 10,
  },
  removeButton: {
    marginBottom: 10,
    backgroundColor: Colors.RED,
  },
  addButton: {
    marginBottom: 15,
    backgroundColor: Colors.GREEN_MAIN,
  },
  errorText: {
    color: Colors.RED,
    marginVertical: 10,
  },
  editWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContent: {
    padding: 15,
  },
  closeButton: {
    backgroundColor: 'transparent',
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  datePickerWrapper: {
    marginBottom: 15,
  },
  datePicker: {
    marginBottom: 10,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorSubText: {
    ...UILTypography.text90,
    color: Colors.grey20,
    marginBottom: 10,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    marginBottom: 15,
  },
  globalFilterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
});

export default FilterEditContent;