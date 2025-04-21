import React, { useState, useEffect, useRef, useImperativeHandle, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { kbnetApiSlice } from '@/Services/modules/kbnet';
import Filter from '@/Components/Filter';
import { Picker, Checkbox, TabController, TextField } from 'react-native-ui-lib';
import { reportPeriodsValues } from '@/Constants/reportPeriodsValues';
import dayjs from 'dayjs';
import { find, keys, sortBy } from 'lodash';
import { useAppDispatch, useAppSelector, useTheme } from '@/Hooks';
import { getDatasets, selectDatasetId } from '@/Store/Auth';
import { getKbnetData } from '@/Store/Kbnet';
import { getStoryBoardData } from '@/Store/Storyboard';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '@/Theme/Variables';
import { toTitleCase } from '@/Utils/common';


declare module 'react-native-ui-lib' {
  interface PickerProps {
    selectedValue?: any;
    onValueChange?: (value: any, index: number) => void;
    style?: any;
    itemStyle?: any;
  }
}



interface DashboardFiltersProps {
  pinboardID: string;
  itemsVisible: boolean;
  closeFn: () => void;
  retainFiltersRef?: React.Ref<any>;
  crossRetainFilter?: any[];
}


const DashboardFilters = React.forwardRef<any, DashboardFiltersProps>(({
  pinboardID,
  itemsVisible,
  closeFn,
  retainFiltersRef,
  crossRetainFilter,
}, ref) => {
  const dispatch = useAppDispatch();
  const dataset = useAppSelector(getDatasets);
  const kbnet = useAppSelector(getKbnetData);
  const storyboard = useAppSelector(getStoryBoardData);
  const [loading, setLoading] = useState(true);
  const [failedFetchData, setFailedFetchData] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [crossFilterItems, setCrossFilterItems] = useState<any[]>([]);
  const filterItemsRef: any = useRef();
  const [filterItems, setFilterItems] = useState<any[]>([]);
  filterItemsRef.current = filterItems;
  const [selectDatasetValues, setSelectDatasetValues] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateFilterData, setDateFilterData] = useState<any>({});
  const [dateFilterRangeValues, setDateFilterRangeValues] = useState([dayjs(), dayjs()]);
  const [selectedSubjectID, setSelectedSubjectID] = useState('others');
  const [subjectAreaOptions, setSubjectAreaOptions] = useState<any[]>([]);
  const { Colors } = useTheme()

  const colors = {
    dimensions: Colors.GREEN_DARK,
    flag: Colors.GREEN_MAIN,
    date: Colors.DARK_BLUE,
    'Smart Column': Colors.GRAY_DARK,
    'calculated dimension': Colors.GRAY,
  };

  console.log('selected dataset is ', selectedDataset)


  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        dispatch(kbnetApiSlice.endpoints.metadata.initiate(selectedDataset)),
        dispatch(kbnetApiSlice.endpoints.synonyms.initiate(selectedDataset)),
        dispatch(kbnetApiSlice.endpoints.tableMetadata.initiate(selectedDataset)),
        dispatch(kbnetApiSlice.endpoints.subjectAreas.initiate(selectedDataset)),
      ]);
    } catch (error) {
      setFailedFetchData(true);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchData()
  }, [pinboardID, selectedDataset])

  const generateRetainFilters = (isSaveOrUpdated?: boolean) => {

    const retainFilters: any[] = [
      {
        category: 'dateFilter',
        isDefault: true,
        isDisable: false,
        isSingleValue: false,
        processedRequestID: '',
        ...dateFilterData,
        value: dateFilter !== 'all' ? dateFilter || [] : [],
        dateValueFrom: dateFilterRangeValues?.[0]?.format('MM/DD/YYYY') || null,
        dateValueTo: dateFilterRangeValues?.[1]?.format('MM/DD/YYYY') || null,
      },
    ];

    filterItemsRef.current.forEach((fItem: any) => {
      const innerItem: any = {
        category: fItem.category || '',
        data_set: fItem.data_set || '',
        dateValueFrom: '',
        dateValueTo: '',
        dateValues: fItem?.editedContent?.operatorValue === 'between' ? fItem.dateValues || null : null,
        id: fItem.id || '',
        isDefault: fItem.isDefault || false,
        isDisable: fItem.isDisable || false,
        isSingleValue: fItem?.editedContent?.isSingleValue || false,
        processedID: fItem.processedID || '',
        processedRequestID: fItem.category === 'Smart Column' ? fItem.smartColumnKey : fItem.processedRequestID || '',
        value: [],
        vocabulary: fItem.vocabulary || [],
        operator: fItem?.editedContent?.operatorValue || '',
        globalFilter: fItem?.editedContent?.globalFilter || {},
      };

      delete innerItem.item;

      if (fItem.editedContent) {
        if (['dimensions', 'Smart Column', 'calculated dimension'].includes(fItem.category)) {
          innerItem.value = fItem.editedContent.inputValue.map((value: any) => ({
            id: value.split('@@')?.[0]?.trim() === '' ? '' : value.split('@@')?.[0] || value,
            name: value.split('@@')?.[1]?.trim() === '' ? '' : value.split('@@')?.[1] || value,
          }));
        }

        const dateContent: any = [];
        if (fItem.category === 'date') {
          if (fItem?.editedContent?.operatorValue === 'between') {
            fItem?.editedContent?.dateValues?.map((item: any) => {
              const dateRange = {
                dateValueFrom: item.dateValueFrom ? item?.dateValueFrom?.format('MM/DD/YYYY') : undefined,
                dateValueTo: item.dateValueTo ? item?.dateValueTo?.format('MM/DD/YYYY') : undefined,
              };
              dateContent.push(dateRange);
              return dateRange;
            });
          }
          innerItem.dateValues = dateContent;
          innerItem.value = fItem.editedContent.inputValue;
        }

        if (fItem.category === 'flag') {
          innerItem.value = fItem.editedContent.inputValue;
        }
      }

      retainFilters.push(innerItem);
    });

    return retainFilters;
  };

  useImperativeHandle(retainFiltersRef, () => ({
    getRetainFilters: () => generateRetainFilters(),
  }));


  useEffect(() => {
    const reportPeriod = { ...dateFilterData };
    reportPeriod.isDisable = false;
    setDateFilterData(reportPeriod);
  }, []);

  useEffect(() => {
    if (crossRetainFilter?.length && items.length) {
      const filterArr: any[] = [];
      crossRetainFilter.forEach((col) => {
        const colKey = keys(col);
        const findCol = find(items, { processedID: colKey[0] });
        const filterObj = {
          ...findCol,
          is_editable: true,
          isSingleValue: false,
          isDisable: false,
          isDefault: false,
          value: [
            {
              id: col[colKey[0]],
              name: col[colKey[0]],
            },
          ],
          operator: 'is',
          editedContent: {
            operatorValue: 'is',
            inputValue: [`${col[colKey[0]]}@@${col[colKey[0]]}`],
            dateValue: null,
            dateValueTo: null,
            btnLabel: `is ${col[colKey[0]]}`,
            isSingleValue: false,
            isDisable: false,
            dateValues: [
              {
                dateValueFrom: '',
                dateValueTo: '',
              },
            ],
          },
        };
        filterArr.push(filterObj);
      });
      setFilterItems([...crossFilterItems, ...filterArr]);
      setCrossFilterItems([...crossFilterItems, ...filterArr]);
    }
  }, [crossRetainFilter, items]);


  useEffect(() => {
    setLoading(true);
    if (kbnet[selectedDataset]?.metadata &&
      kbnet[selectedDataset]?.synonyms &&
      kbnet[selectedDataset]?.tableMetadata) {
      setLoading(false);
      setFailedFetchData(false);
    } 
  }, [selectedDataset, kbnet]);

  const renderFilterItems = () => {
    if (kbnet) {
      if (kbnet[selectedDataset]?.metadata &&
        kbnet[selectedDataset]?.synonyms &&
        kbnet[selectedDataset]?.tableMetadata) {

        const metadata = kbnet[selectedDataset]?.metadata;
        const synonyms = kbnet[selectedDataset]?.synonyms;
        const newItems: any[] = [];

        const constructItem = (item: any) => {
          const constructProcessedID = item.table ? `${item.table}.${item.id}` : item.id;
          newItems.push({
            ...item,
            processedID: constructProcessedID,
            subjectID: kbnet[selectedDataset]?.tableMetadata?.[item.table]?.subjectID || 'others',
            smartColumnKey: item.category === 'Smart Column' ? item?.additional_data?.columns?.[0] || constructProcessedID : constructProcessedID,
            label: item.table ? `${toTitleCase(item.table, true)}.${item.id}` : item.id,
            vocabulary: [],
          });
        };

        metadata.column_data?.forEach?.((item: any) => {
          const constructsynonymsID = item?.table ? `${item?.table}.${item?.id}` : `${item?.data_set}.${item?.id}`;
          if (synonyms?.[constructsynonymsID]?.[0]?.value) {
            newItems.push({
              ...item,
              processedID: constructsynonymsID,
              subjectID: kbnet[selectedDataset]?.tableMetadata?.[item.table]?.subjectID || 'others',
              smartColumnKey: item.category === 'Smart Column' ? item?.additional_data?.columns?.[0] || constructsynonymsID : constructsynonymsID,
              label: `${toTitleCase(synonyms?.[constructsynonymsID]?.[0]?.value, true)} (${item.table ? `${toTitleCase(item.table, true)}.${item.id}` : item.id})`,
              vocabulary: sortBy(synonyms?.[constructsynonymsID], ['default'])
                .reverse()
                .map((item) => item.value),
            });
          } else {
            constructItem(item);
          }
        });
        setItems(
          newItems.filter((item: any) => {
            const colsLen = item?.additional_data?.columns?.length || 0;
            return ['dimensions', 'date', 'flag', 'Smart Column', 'calculated dimension'].includes(item.category) && colsLen <= 2;
          })
        );
      }
    }
  };

  const ColumnItem = ({ item, isSelected, backgroundColor, textColor, onPress }: {
    item: any;
    isSelected: boolean;
    backgroundColor: string;
    textColor: string;
    onPress: () => void;
  }) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
      <>
        <TouchableOpacity
          style={[styles.item, backgroundColor && { backgroundColor }]}
          onPress={onPress}
          onLongPress={() => setModalVisible(true)}
        >
          <Text style={[styles.itemText, { color: textColor }]}>
            {item.vocabulary?.[0] ? toTitleCase(item.vocabulary[0]) : item.label || item.processedID}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Column Info</Text>
              <ScrollView>
                {!!item?.table && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Table:</Text>
                    <Text style={styles.infoValue}>{item.table}</Text>
                  </View>
                )}
                {!!item?.id && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Column:</Text>
                    <Text style={styles.infoValue}>{item.id}</Text>
                  </View>
                )}
                {!!item?.category && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Category:</Text>
                    <Text style={styles.infoValue}>{toTitleCase(item.category)}</Text>
                  </View>
                )}
                {!!item?.vocabulary?.length && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Synonyms:</Text>
                    <Text style={styles.infoValue}>{item.vocabulary.join(', ')}</Text>
                  </View>
                )}
              </ScrollView>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  };

  const addFilterItem = (id: any, values: any) => {
    if (id) {
      const items = [...filterItemsRef.current];
      const findItemIndex = items.findIndex(item => item.processedID === id);
      if (findItemIndex >= 0) {
        items[findItemIndex].editedContent = values;
        items[findItemIndex].isDisable = values.isDisable;
        setFilterItems([...items]);
      }
    }
  };

  useEffect(() => {
    if (pinboardID && storyboard?.componentsDatasetIds) {
      const datasets: any[] = storyboard?.componentsDatasetIds?.[pinboardID] || [];
      const newDatasetValues: any[] = [];
      datasets.forEach((ds: any) => {
        const dsItem = dataset?.find((item: any) => item.dataSetID === ds);
        if (dsItem) {
          newDatasetValues.push({
            id: ds,
            name: dsItem.datasetName,
          });
        }
      });
      setSelectDatasetValues(newDatasetValues);
    }
  }, [pinboardID, selectedDataset]);



  useEffect(() => {
    if (selectDatasetValues.length) {
      setSelectedDataset(selectDatasetValues?.[0]?.id || '');
      renderFilterItems();
      setSelectedSubjectID('others');
    } else {
      setItems([]);
    }
  }, [selectDatasetValues]);

  useEffect(() => {
    if (kbnet && selectedDataset) {
      renderFilterItems();
    }
  }, [selectedDataset, kbnet]);

  useEffect(() => {
    if (kbnet[selectedDataset]?.subjectArea) {
      const options = kbnet[selectedDataset]?.subjectArea?.map((item: any) => ({
        label: item.name,
        value: item.subjectID,
      }));
      options?.unshift({ label: 'Others', value: 'others' });
      setSubjectAreaOptions(options);
    }
  }, [selectedDataset, kbnet]);


  const ColumnItemsMemo = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.GREEN_MAIN} />
        </View>
      );
    }

    return items
      .filter((item) => {
        const matchesSubject = selectedSubjectID ? item.subjectID === selectedSubjectID : true;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          item.label?.toLowerCase().includes(searchLower) ||
          item.vocabulary?.join(',').toLowerCase().includes(searchLower);
        return matchesSubject && matchesSearch;
      })
      .map((item: any, i) => {
        const isSelected = !!filterItems.find((fItem: any) => fItem.processedID === item.processedID);
        const backgroundColor = colors[item.category as keyof typeof colors] || Colors.NOTIFICATION_GREEN;
        const textColor = isSelected ? Colors.WHITE : '#000';

        return (
          <ColumnItem
            key={item.processedID + i}
            item={item}
            isSelected={isSelected}
            backgroundColor={isSelected ? backgroundColor : '#f2f2f2'}
            textColor={textColor}
            onPress={() => {
              setFilterItems(
                !isSelected
                  ? [...filterItems, { ...item, is_editable: true }]
                  : filterItems.filter((fItem: any) => fItem.processedID !== item.processedID)
              );
            }}
          />
        );

      });
  }, [items, searchQuery, filterItems, selectedSubjectID, loading]);


  return (
    <View style={[styles.container, { maxHeight: '90%' }]}>
      <TabController items={[{ label: 'Report Period' }, { label: 'Dataset' }, { label: 'Column' }]} useSafeArea={true} carouselPageWidth={10} >
        <TabController.TabBar
          enableShadow={true}
          height={44}
          containerStyle={{
            backgroundColor: Colors.WHITE,
            paddingHorizontal: 0,
            paddingVertical: 0,
            marginHorizontal: 0,
            marginVertical: 0,
          }}
          labelStyle={{
            color: Colors.GREEN_DARK,
            padding: 15,
            margin: 0,
          }}
          selectedLabelStyle={{
            color: Colors.GREEN_MAIN,
            padding: 0,
            margin: 0,
          }}
          indicatorStyle={{
            height: 2,
            backgroundColor: Colors.GREEN_MAIN,
            alignSelf: 'center',
            width: '30%',
          }}
          activeBackgroundColor="transparent"
          backgroundColor="transparent"
          uppercase={false}
          spreadItems={false}
        />
        <TabController.TabPage index={0} lazy={true} >
          <ScrollView contentContainerStyle={styles.scrollContainer} >
            <Picker
              placeholder="Select a period"
              floatingPlaceholder
              value={dateFilter}
              onChange={(item: { value: string }) => setDateFilter(item.value)}
              topBarProps={{ title: 'Select a Period' }}
              showSearch
              style={styles.picker}
            >
              {reportPeriodsValues.map((item) => (
                <Picker.Item key={item.value} value={item.value} label={item.text} />
              ))}
            </Picker>

            {dateFilter === 'between' && (
              <View style={styles.dateRangeWrapper}>
                <DateTimePicker
                  value={dateFilterRangeValues[0]?.isValid() ? dateFilterRangeValues[0].toDate() : new Date()}
                  onChange={(event, date) => {
                    if (date && event.type !== 'dismissed') {
                      setDateFilterRangeValues([dayjs(date), dateFilterRangeValues[1]]);
                    }
                  }}
                  mode="date"
                  display="default"
                />
                <Text style={styles.dateSeparator}>to</Text>
                <DateTimePicker
                  value={dateFilterRangeValues[1]?.isValid() ? dateFilterRangeValues[1].toDate() : new Date()}
                  onChange={(event, date) => {
                    if (date && event.type !== 'dismissed') {
                      setDateFilterRangeValues([dateFilterRangeValues[0], dayjs(date)]);
                    }
                  }}
                  mode="date"
                  display="default"
                />
              </View>
            )}
          </ScrollView>
        </TabController.TabPage>

        {/* Data Selection Tab */}
        <TabController.TabPage index={1}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.GREEN_MAIN} />
            ) : (
              <>
                <Text style={styles.label}>Dataset</Text>
                <Picker
                  value={selectedDataset}
                  onChange={(item: { value: string }) => {
                    setSelectedDataset(item.value);
                    setSelectedSubjectID('others');
                  }}
                  style={styles.picker}
                >
                  {selectDatasetValues.map(ds => (
                    <Picker.Item key={ds.id} label={ds.name} value={ds.id} />
                  ))}
                </Picker>

                <Text style={styles.label}>Subject Area</Text>
                <Picker
                  value={selectedSubjectID}
                  onChange={(item: { value: string }) => setSelectedSubjectID(item.value)}
                  style={styles.picker}
                >
                  {subjectAreaOptions.map(opt => (
                    <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                  ))}
                </Picker>

                {failedFetchData && (
                  <TouchableOpacity onPress={fetchData} style={styles.retryBtn}>
                    <Text style={styles.retryText}>Try again</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </ScrollView>
        </TabController.TabPage>

        {/* Results Tab */}
        <TabController.TabPage index={2}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <TextField
              placeholder="Search..."
              placeholderTextColor={Colors.GRAY_DARK}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: Colors.GREEN_DARK }]}
            />
            <ScrollView style={styles.itemsInnerWrapper}>
              {filterItems.map((item) => (
                <View key={item.processedID}>
                  <Filter
                    columnItem={item}
                    removeItemFn={() => {
                      setCrossFilterItems(filterItemsRef?.current?.filter((fItem: any) => fItem.processedID !== item.processedID));
                      setFilterItems(filterItemsRef?.current?.filter((fItem: any) => fItem.processedID !== item.processedID));
                    }}
                    addFilterItem={addFilterItem}
                    setLoading={setLoading}
                  />
                </View>
              ))}
              {ColumnItemsMemo}
            </ScrollView>
          </ScrollView>
        </TabController.TabPage>
      </TabController>

    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height:'75%',
    borderBottomWidth: 1,
    borderBottomColor: Colors.GREEN_DARK,
    paddingVertical: 12,
  },
  picker: {
    borderWidth: 1,
    borderColor: Colors.GREEN_DARK,
    borderRadius: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  chip: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: Colors.GRAY_LIGHT,
    borderColor: Colors.GREEN_DARK,
  },
  editPanel: {
    padding: 16,
    backgroundColor: Colors.GRAY_LIGHT,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.GREEN_DARK,
    borderRadius: 8,
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: Colors.GREEN_DARK,
    borderRadius: 8,
    padding: 12,
  },
  scrollContainer: { marginTop: 80, padding: 0 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  checkbox: { marginBottom: 10 },
  dateSeparator: { marginHorizontal: 10 },
  runBtn: { padding: 12, borderRadius: 8, alignItems: 'center' },
  runBtnText: { color: Colors.WHITE, fontWeight: '600' },
  label: { marginTop: 10, marginBottom: 5 },
  retryText: { color: 'red' },
  filterItem: { padding: 10, backgroundColor: '#eee', marginBottom: 10 },
  removeText: { color: 'red' },
  noDataText: { textAlign: 'center', marginTop: 20 }
  ,
  filtersWrapper: {
    flexDirection: 'row',
  },
  tabBar: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginHorizontal: 0,
    marginVertical: 0,
  },
  filterItemsWrapper: {
    flex: 1,
    maxHeight: 200,
    padding: 10,
  },
  filterItemWrapper: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rightItems: {
    padding: 10,
  },
  buttonsWrapper: {
    flexDirection: 'column',
  },
  runReportBtn: {
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  runReportText: {
    color: Colors.WHITE,
  },
  itemsWrapper: {
    flex: 1,
  },
  titleBar: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectWrapper: {
    flex: 1,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 5,
    flex: 1,
  },
  itemsInnerWrapper: {
    padding: 10,
  },
  item: {
    padding: 15,
    margin: 5,
    borderRadius: 4,
  },
  itemText: {
    fontSize: 14,
  },
  noItems: {
    padding: 20,
    alignItems: 'center',
  },
  dropdownBtnStyle: {
    width: '100%',
    height: 40,
    backgroundColor: Colors.WHITE,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateRangeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  datasetDropdownBtn: {
    width: '100%',
    height: 40,
    backgroundColor: Colors.WHITE,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datasetDropdownTxt: {
    textAlign: 'left',
  },
  subjectDropdownBtn: {
    width: '100%',
    height: 40,
    backgroundColor: Colors.WHITE,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  subjectDropdownTxt: {
    textAlign: 'left',
  },
  retryBtn: {
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    padding: 20,
    borderRadius: 12,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  infoValue: {
    flexShrink: 1,
  },
  closeBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  closeText: {
    color: '#000',
  },
});

export default DashboardFilters;