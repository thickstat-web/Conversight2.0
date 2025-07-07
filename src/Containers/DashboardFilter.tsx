import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  useMemo,
} from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  Animated,
  Easing,
} from 'react-native'
import { kbnetApiSlice } from '@/Services/modules/kbnet'
import Filter from '@/Components/Filter'
import { Picker, Checkbox, TextField } from 'react-native-ui-lib'
import { reportPeriodsValues } from '@/Constants/reportPeriodsValues'
import dayjs from 'dayjs'
import { find, keys, sortBy } from 'lodash'
import { useAppDispatch, useAppSelector, useTheme } from '@/Hooks'
import { getDatasets, selectDatasetId } from '@/Store/Auth'
import { getKbnetData } from '@/Store/Kbnet'
import { getStoryBoardData } from '@/Store/Storyboard'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Colors } from '@/Theme/Variables'
import { toTitleCase } from '@/Utils/common'
import Icon from 'react-native-vector-icons/MaterialIcons'

const { width } = Dimensions.get('window')

declare module 'react-native-ui-lib' {
  interface PickerProps {
    selectedValue?: any
    onValueChange?: (value: any, index: number) => void
    style?: any
    itemStyle?: any
  }
}

interface DashboardFiltersProps {
  pinboardID: string
  itemsVisible: boolean
  closeFn: () => void
  retainFiltersRef?: React.Ref<any>
  crossRetainFilter?: any[]
}

const DashboardFilters = React.forwardRef<any, DashboardFiltersProps>(
  (
    { pinboardID, itemsVisible, closeFn, retainFiltersRef, crossRetainFilter },
    ref,
  ) => {
    const dispatch = useAppDispatch()
    const dataset = useAppSelector(getDatasets)
    const kbnet = useAppSelector(getKbnetData)
    const storyboard = useAppSelector(getStoryBoardData)
    const [loading, setLoading] = useState(true)
    const [failedFetchData, setFailedFetchData] = useState(false)
    const [items, setItems] = useState<any[]>([])
    const [crossFilterItems, setCrossFilterItems] = useState<any[]>([])
    const filterItemsRef: any = useRef()
    const [filterItems, setFilterItems] = useState<any[]>([])
    filterItemsRef.current = filterItems
    const [selectDatasetValues, setSelectDatasetValues] = useState<any[]>([])
    const [selectedDataset, setSelectedDataset] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [dateFilter, setDateFilter] = useState('all')
    const [dateFilterData, setDateFilterData] = useState<any>({})
    const [dateFilterRangeValues, setDateFilterRangeValues] = useState([
      dayjs(),
      dayjs(),
    ])
    const [selectedSubjectID, setSelectedSubjectID] = useState('others')
    const [subjectAreaOptions, setSubjectAreaOptions] = useState<any[]>([])
    const { Colors } = useTheme()
    const [activeTab, setActiveTab] = useState(0)
    const [showPeriodPicker, setShowPeriodPicker] = useState(false)
    const [showDatasetPicker, setShowDatasetPicker] = useState(false)
    const [showSubjectPicker, setShowSubjectPicker] = useState(false)
    const slideAnim = useRef(new Animated.Value(0)).current
    const [showStartDatePicker, setShowStartDatePicker] = useState(false)
    const [showEndDatePicker, setShowEndDatePicker] = useState(false)
    const [periodSearchQuery, setPeriodSearchQuery] = useState('')
    const [datasetSearchQuery, setDatasetSearchQuery] = useState('')
    const [subjectSearchQuery, setSubjectSearchQuery] = useState('')

    const colors = {
      dimensions: Colors.GREEN_DARK,
      flag: Colors.GREEN_MAIN,
      date: Colors.GREEN_DARK,
      'Smart Column': Colors.GRAY_DARK,
      'calculated dimension': Colors.GRAY,
    }

    useEffect(() => {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start()
    }, [])

    const fetchData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          dispatch(kbnetApiSlice.endpoints.metadata.initiate(selectedDataset)),
          dispatch(kbnetApiSlice.endpoints.synonyms.initiate(selectedDataset)),
          dispatch(
            kbnetApiSlice.endpoints.tableMetadata.initiate(selectedDataset),
          ),
          dispatch(
            kbnetApiSlice.endpoints.subjectAreas.initiate(selectedDataset),
          ),
        ])
      } catch (error) {
        setFailedFetchData(true)
      } finally {
        setLoading(false)
      }
    }

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
          dateValueFrom:
            dateFilterRangeValues?.[0]?.format('MM/DD/YYYY') || null,
          dateValueTo: dateFilterRangeValues?.[1]?.format('MM/DD/YYYY') || null,
        },
      ]

      filterItemsRef.current.forEach((fItem: any) => {
        
        const innerItem: any = {
          category: fItem.category || '',
          data_set: fItem.data_set || '',
          dateValueFrom: '',
          dateValueTo: '',
          dateValues:
            fItem?.editedContent?.operatorValue === 'between'
              ? fItem.dateValues || null
              : null,
          id: fItem.id || '',
          isDefault: fItem.isDefault || false,
          isDisable: fItem.isDisable || false,
          isSingleValue: fItem?.editedContent?.isSingleValue || false,
          processedID: fItem.processedID || '',
          processedRequestID:
            fItem.category === 'Smart Column'
              ? fItem.smartColumnKey
              : fItem.processedRequestID || '',
          value: [],
          vocabulary: fItem.vocabulary || [],
          operator: fItem?.editedContent?.operatorValue || '',
          globalFilter: fItem?.editedContent?.globalFilter || {},
        }

        delete innerItem.item

        if (fItem.editedContent) {
          if (
            ['dimensions', 'Smart Column', 'calculated dimension'].includes(
              fItem.category,
            )
          ) {
            innerItem.value = fItem.editedContent.inputValue.map(
              (value: any) => ({
                id:
                  value.split('@@')?.[0]?.trim() === ''
                    ? ''
                    : value.split('@@')?.[0] || value,
                name:
                  value.split('@@')?.[1]?.trim() === ''
                    ? ''
                    : value.split('@@')?.[1] || value,
              }),
            )
          }

          const dateContent: any = []
          if (fItem.category === 'date') {
            if (fItem?.editedContent?.operatorValue === 'between') {
              fItem?.editedContent?.dateValues?.map((item: any) => {
                const dateRange = {
                  dateValueFrom: item.dateValueFrom
                    ? item?.dateValueFrom?.format('MM/DD/YYYY')
                    : undefined,
                  dateValueTo: item.dateValueTo
                    ? item?.dateValueTo?.format('MM/DD/YYYY')
                    : undefined,
                }
                dateContent.push(dateRange)
                return dateRange
              })
            }
            innerItem.dateValues = dateContent
            innerItem.value = fItem.editedContent.inputValue
          }

          if (fItem.category === 'flag') {
            innerItem.value = fItem.editedContent.inputValue
          }
        }

        retainFilters.push(innerItem)
      })

      return retainFilters
    }

    useImperativeHandle(retainFiltersRef, () => ({
      getRetainFilters: () => generateRetainFilters(),
    }))

    useEffect(() => {
      const reportPeriod = { ...dateFilterData }
      reportPeriod.isDisable = false
      setDateFilterData(reportPeriod)
    }, [])

    useEffect(() => {
      if (crossRetainFilter?.length && items.length) {
        const filterArr: any[] = []
        crossRetainFilter.forEach(col => {
          const colKey = keys(col)
          const findCol = find(items, { processedID: colKey[0] })
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
          }
          filterArr.push(filterObj)
        })
        setFilterItems([...crossFilterItems, ...filterArr])
        setCrossFilterItems([...crossFilterItems, ...filterArr])
      }
    }, [crossRetainFilter, items])

    useEffect(() => {
      setLoading(true)
      if (
        kbnet[selectedDataset]?.metadata &&
        kbnet[selectedDataset]?.synonyms &&
        kbnet[selectedDataset]?.tableMetadata
      ) {
        setLoading(false)
        setFailedFetchData(false)
      }
    }, [selectedDataset, kbnet])

    const renderFilterItems = () => {
      if (kbnet) {
        if (
          kbnet[selectedDataset]?.metadata &&
          kbnet[selectedDataset]?.synonyms &&
          kbnet[selectedDataset]?.tableMetadata
        ) {
          const metadata = kbnet[selectedDataset]?.metadata
          const synonyms = kbnet[selectedDataset]?.synonyms
          const newItems: any[] = []

          const constructItem = (item: any) => {
            const constructProcessedID = item.table
              ? `${item.table}.${item.id}`
              : item.id
            newItems.push({
              ...item,
              processedID: constructProcessedID,
              subjectID:
                kbnet[selectedDataset]?.tableMetadata?.[item.table]
                  ?.subjectID || 'others',
              smartColumnKey:
                item.category === 'Smart Column'
                  ? item?.additional_data?.columns?.[0] || constructProcessedID
                  : constructProcessedID,
              label: item.table
                ? `${toTitleCase(item.table, true)}.${item.id}`
                : item.id,
              vocabulary: [],
            })
          }

          metadata.column_data?.forEach?.((item: any) => {
            const constructsynonymsID = item?.table
              ? `${item?.table}.${item?.id}`
              : `${item?.data_set}.${item?.id}`
            if (synonyms?.[constructsynonymsID]?.[0]?.value) {
              newItems.push({
                ...item,
                processedID: constructsynonymsID,
                subjectID:
                  kbnet[selectedDataset]?.tableMetadata?.[item.table]
                    ?.subjectID || 'others',
                smartColumnKey:
                  item.category === 'Smart Column'
                    ? item?.additional_data?.columns?.[0] || constructsynonymsID
                    : constructsynonymsID,
                label: `${toTitleCase(
                  synonyms?.[constructsynonymsID]?.[0]?.value,
                  true,
                )} (${
                  item.table
                    ? `${toTitleCase(item.table, true)}.${item.id}`
                    : item.id
                })`,
                vocabulary: sortBy(synonyms?.[constructsynonymsID], ['default'])
                  .reverse()
                  .map(item => item.value),
              })
            } else {
              constructItem(item)
            }
          })
          setItems(
            newItems.filter((item: any) => {
              const colsLen = item?.additional_data?.columns?.length || 0
              return (
                [
                  'dimensions',
                  'date',
                  'flag',
                  'Smart Column',
                  'calculated dimension',
                ].includes(item.category) && colsLen <= 2
              )
            }),
          )
        }
      }
    }

    const ColumnItem = ({
      item,
      isSelected,
      backgroundColor,
      textColor,
      onPress,
    }: {
      item: any
      isSelected: boolean
      backgroundColor: string
      textColor: string
      onPress: () => void
    }) => {
      const [modalVisible, setModalVisible] = useState(false)

      return (
        <>
          <TouchableOpacity
            style={[
              styles.item,
              isSelected ? styles.selectedItem : styles.unselectedItem,
              isSelected && { backgroundColor },
            ]}
            onPress={onPress}
            onLongPress={() => setModalVisible(true)}
          >
            <Text
              style={[
                styles.itemText,
                { color: isSelected ? Colors.WHITE : textColor },
              ]}
            >
              {item.vocabulary?.[0]
                ? toTitleCase(item.vocabulary[0])
                : item.label || item.processedID}
            </Text>
            {isSelected && (
              <Icon
                name="check"
                size={18}
                color={Colors.WHITE}
                style={styles.itemIcon}
              />
            )}
          </TouchableOpacity>

          <Modal
            visible={modalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Column Details</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Icon name="close" size={24} color={Colors.GRAY_DARK} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  <View style={styles.infoSection}>
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
                        <Text style={styles.infoValue}>
                          {toTitleCase(item.category)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {!!item?.vocabulary?.length && (
                    <View style={styles.infoSection}>
                      <Text style={styles.sectionTitle}>Synonyms</Text>
                      <View style={styles.synonymsContainer}>
                        {item.vocabulary.map((syn: string, index: number) => (
                          <View key={index} style={styles.synonymTag}>
                            <Text style={styles.synonymText}>{syn}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </>
      )
    }

    const addFilterItem = (id: any, values: any) => {
      if (id) {
        const items = [...filterItemsRef.current]
        const findItemIndex = items.findIndex(item => item.processedID === id)
        if (findItemIndex >= 0) {
          items[findItemIndex].editedContent = values
          items[findItemIndex].isDisable = values.isDisable
          setFilterItems([...items])
        }
      }
    }

    useEffect(() => {
      if (pinboardID && storyboard?.componentsDatasetIds) {
        const datasets: any[] =
          storyboard?.componentsDatasetIds?.[pinboardID] || []
        const newDatasetValues: any[] = []
        datasets.forEach((ds: any) => {
          const dsItem = dataset?.find((item: any) => item.dataSetID === ds)
          if (dsItem) {
            newDatasetValues.push({
              id: ds,
              name: dsItem.datasetName,
            })
          }
        })
        setSelectDatasetValues(newDatasetValues)
      }
    }, [pinboardID, selectedDataset])

    useEffect(() => {
      if (selectDatasetValues.length) {
        setSelectedDataset(selectDatasetValues?.[0]?.id || '')
        renderFilterItems()
        setSelectedSubjectID('others')
      } else {
        setItems([])
      }
    }, [selectDatasetValues])

    useEffect(() => {
      if (kbnet && selectedDataset) {
        renderFilterItems()
      }
    }, [selectedDataset, kbnet])

    useEffect(() => {
      if (kbnet[selectedDataset]?.subjectArea) {
        const options = kbnet[selectedDataset]?.subjectArea?.map(
          (item: any) => ({
            label: item.name,
            value: item.subjectID,
          }),
        )
        options?.unshift({ label: 'Others', value: 'others' })
        setSubjectAreaOptions(options)
      }
    }, [selectedDataset, kbnet])

    const ColumnItemsMemo = useMemo(() => {
      if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.GREEN_MAIN} />
            <Text style={styles.loadingText}>Loading columns...</Text>
          </View>
        )
      }

      if (items.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Icon name="info-outline" size={40} color={Colors.GRAY} />
            <Text style={styles.emptyText}>No columns available</Text>
          </View>
        )
      }

      return (
        <View style={styles.columnsGrid}>
          {items
            .filter(item => {
              const matchesSubject = selectedSubjectID
                ? item.subjectID === selectedSubjectID
                : true
              const searchLower = searchQuery.toLowerCase()
              const matchesSearch =
                item.label?.toLowerCase().includes(searchLower) ||
                item.vocabulary?.join(',').toLowerCase().includes(searchLower)
              return matchesSubject && matchesSearch
            })
            .map((item: any, i) => {
              const isSelected = !!filterItems.find(
                (fItem: any) => fItem.processedID === item.processedID,
              )
              const backgroundColor =
                colors[item.category as keyof typeof colors] ||
                Colors.NOTIFICATION_GREEN
              const textColor = isSelected ? Colors.WHITE : Colors.GREEN_DARK

              return (
                <ColumnItem
                  key={item.processedID + i}
                  item={item}
                  isSelected={isSelected}
                  backgroundColor={backgroundColor}
                  textColor={textColor}
                  onPress={() => {
                    setFilterItems(
                      !isSelected
                        ? [...filterItems, { ...item, is_editable: true }]
                        : filterItems.filter(
                            (fItem: any) =>
                              fItem.processedID !== item.processedID,
                          ),
                    )
                  }}
                />
              )
            })}
        </View>
      )
    }, [items, searchQuery, filterItems, selectedSubjectID, loading])

    const renderPeriodPicker = () => {
      const filteredPeriods = reportPeriodsValues.filter(item =>
        item.text.toLowerCase().includes(periodSearchQuery.toLowerCase()),
      )

      return (
        <Modal
          visible={showPeriodPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setPeriodSearchQuery('')
            setShowPeriodPicker(false)
          }}
        >
          <View style={styles.pickerModalBackdrop}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerModalHeader}>
                <Text style={styles.pickerModalTitle}>
                  Select Report Period
                </Text>
                <TouchableOpacity onPress={() => setShowPeriodPicker(false)}>
                  <Icon name="close" size={24} color={Colors.GRAY_DARK} />
                </TouchableOpacity>
              </View>

              <TextField
                placeholder="Search periods..."
                placeholderTextColor={Colors.GRAY_DARK}
                value={periodSearchQuery}
                onChangeText={setPeriodSearchQuery}
                style={styles.searchInput}
                containerStyle={styles.searchContainer}
                leadingAccessory={
                  <Icon
                    name="search"
                    size={20}
                    color={Colors.GRAY}
                    style={styles.searchIcon}
                  />
                }
                underlineColor={Colors.GREEN_DARK}
                focusOnLayout={true}
              />

              <ScrollView style={styles.pickerOptions}>
                {filteredPeriods.length > 0 ? (
                  filteredPeriods.map(item => (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.pickerOption,
                        dateFilter === item.value && {
                          backgroundColor: Colors.GREEN_LIGHT,
                        },
                      ]}
                      onPress={() => {
                        setDateFilter(item.value)
                        setShowPeriodPicker(false)
                      }}
                    >
                      <Text style={styles.pickerOptionText}>{item.text}</Text>
                      {dateFilter === item.value && (
                        <Icon name="check" size={20} color={Colors.WHITE} />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Icon name="search" size={40} color={Colors.GRAY_DARK} />
                    <Text style={styles.noResultsText}>No options found</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )
    }

    const renderDatasetPicker = () => {
      const filteredDatasets = selectDatasetValues.filter(ds =>
        ds.name.toLowerCase().includes(datasetSearchQuery.toLowerCase()),
      )

      return (
        <Modal
          visible={showDatasetPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setDatasetSearchQuery('')
            setShowDatasetPicker(false)
          }}
        >
          <View style={styles.pickerModalBackdrop}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerModalHeader}>
                <Text style={styles.pickerModalTitle}>Select Dataset</Text>
                <TouchableOpacity onPress={() => setShowDatasetPicker(false)}>
                  <Icon name="close" size={24} color={Colors.GRAY_DARK} />
                </TouchableOpacity>
              </View>

              <TextField
                placeholder="Search datasets..."
                placeholderTextColor={Colors.GRAY_DARK}
                value={datasetSearchQuery}
                onChangeText={setDatasetSearchQuery}
                style={styles.searchInput}
                containerStyle={styles.searchContainer}
                leadingAccessory={
                  <Icon
                    name="search"
                    size={20}
                    color={Colors.GRAY}
                    style={styles.searchIcon}
                  />
                }
                underlineColor={Colors.GREEN_MAIN}
                focusOnLayout={true}
              />

              <ScrollView style={styles.pickerOptions}>
                {filteredDatasets.length > 0 ? (
                  filteredDatasets.map(ds => (
                    <TouchableOpacity
                      key={ds.id}
                      style={[
                        styles.pickerOption,
                        selectedDataset === ds.id && {
                          backgroundColor: Colors.GREEN_LIGHT,
                        },
                      ]}
                      onPress={() => {
                        setSelectedDataset(ds.id)
                        setSelectedSubjectID('others')
                        setShowDatasetPicker(false)
                      }}
                    >
                      <Text style={styles.pickerOptionText}>{ds.name}</Text>
                      {selectedDataset === ds.id && (
                        <Icon name="check" size={20} color={Colors.WHITE} />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Icon name="search" size={40} color={Colors.GRAY_DARK} />
                    <Text style={styles.noResultsText}>No options found</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )
    }

    const renderSubjectPicker = () => {
      const filteredSubjects = subjectAreaOptions.filter(opt =>
        opt.label.toLowerCase().includes(subjectSearchQuery.toLowerCase()),
      )

      return (
        <Modal
          visible={showSubjectPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setSubjectSearchQuery('')
            setShowSubjectPicker(false)
          }}
        >
          <View style={styles.pickerModalBackdrop}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerModalHeader}>
                <Text style={styles.pickerModalTitle}>Select Subject Area</Text>
                <TouchableOpacity onPress={() => setShowSubjectPicker(false)}>
                  <Icon name="close" size={24} color={Colors.GRAY_DARK} />
                </TouchableOpacity>
              </View>

              <TextField
                placeholder="Search subjects..."
                placeholderTextColor={Colors.GRAY_DARK}
                value={subjectSearchQuery}
                onChangeText={setSubjectSearchQuery}
                style={styles.searchInput}
                containerStyle={styles.searchContainer}
                leadingAccessory={
                  <Icon
                    name="search"
                    size={20}
                    color={Colors.GRAY}
                    style={styles.searchIcon}
                  />
                }
                underlineColor={Colors.GREEN_MAIN}
                focusOnLayout={true}
              />

              <ScrollView style={styles.pickerOptions}>
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.pickerOption,
                        selectedSubjectID === opt.value && {
                          backgroundColor: Colors.GREEN_LIGHT,
                        },
                      ]}
                      onPress={() => {
                        setSelectedSubjectID(opt.value)
                        setShowSubjectPicker(false)
                      }}
                    >
                      <Text style={styles.pickerOptionText}>{opt.label}</Text>
                      {selectedSubjectID === opt.value && (
                        <Icon name="check" size={20} color={Colors.WHITE} />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Icon name="search" size={40} color={Colors.GRAY_DARK} />
                    <Text style={styles.noResultsText}>No options found</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )
    }

    const handleDone = () => {
      const retainFilters = generateRetainFilters()
      closeFn()
    }

    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
            opacity: slideAnim,
          },
        ]}
      >
        {/* Custom Tab Bar */}
        <View style={styles.tabBarContainer}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 0 && styles.activeTab,
              activeTab === 0 && { backgroundColor: Colors.GREEN_MAIN },
            ]}
            onPress={() => setActiveTab(0)}
          >
            <Icon
              name="date-range"
              size={20}
              color={activeTab === 0 ? Colors.WHITE : Colors.GREEN_DARK}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 0 ? styles.activeTabText : styles.inactiveTabText,
              ]}
            >
              Period
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 1 && styles.activeTab,
              activeTab === 1 && { backgroundColor: Colors.GREEN_MAIN },
            ]}
            onPress={() => setActiveTab(1)}
          >
            <Icon
              name="storage"
              size={20}
              color={activeTab === 1 ? Colors.WHITE : Colors.GREEN_DARK}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 1 ? styles.activeTabText : styles.inactiveTabText,
              ]}
            >
              Dataset
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 2 && styles.activeTab,
              activeTab === 2 && { backgroundColor: Colors.GREEN_MAIN },
            ]}
            onPress={() => setActiveTab(2)}
          >
            <Icon
              name="view-column"
              size={20}
              color={activeTab === 2 ? Colors.WHITE : Colors.GREEN_DARK}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 2 ? styles.activeTabText : styles.inactiveTabText,
              ]}
            >
              Column
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 0 && (
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Report Period Settings</Text>

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
                      dateFilter === 'between' &&
                        styles.inactiveSelectButtonText,
                    ]}
                  >
                    {dateFilter === 'between'
                      ? 'Select a period'
                      : dateFilter === 'all'
                      ? 'Select a period'
                      : reportPeriodsValues.find(p => p.value === dateFilter)
                          ?.text || 'Select period'}
                  </Text>
                  <Icon
                    name="keyboard-arrow-down"
                    size={24}
                    color={
                      dateFilter === 'between' ? Colors.GRAY : Colors.GREEN_DARK
                    }
                  />
                </TouchableOpacity>
              </View>

              {/* OR Separator */}
              <View style={styles.orSeparator}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orLine} />
              </View>

              {/* Custom Date Range Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Custom Date Range</Text>

                <View style={styles.customDateRangeContainer}>
                  <Checkbox
                    value={dateFilter === 'between'}
                    onValueChange={(value: any) => {
                      setDateFilter(value ? 'between' : 'all')
                    }}
                    color={Colors.GREEN_MAIN}
                    style={styles.checkbox}
                  />
                  <Text style={styles.customDateRangeLabel}>
                    Enable custom date range
                  </Text>
                </View>

                {/* Always visible but disabled date range inputs */}
                <View
                  style={[
                    styles.dateRangeContainer,
                    dateFilter !== 'between' && styles.disabledDateRange,
                  ]}
                >
                  <View style={styles.dateRangeWrapper}>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() =>
                        dateFilter === 'between' && setShowStartDatePicker(true)
                      }
                      disabled={dateFilter !== 'between'}
                    >
                      <Text
                        style={[
                          styles.dateText,
                          dateFilter !== 'between' && styles.disabledDateText,
                        ]}
                      >
                        {dateFilterRangeValues[0]?.format('MMM D, YYYY') ||
                          'Start date'}
                      </Text>
                      <Icon
                        name="calendar-today"
                        size={18}
                        color={
                          dateFilter === 'between'
                            ? Colors.GREEN_DARK
                            : Colors.GRAY
                        }
                      />
                    </TouchableOpacity>

                    <Text
                      style={[
                        styles.dateSeparator,
                        dateFilter !== 'between' && styles.disabledDateText,
                      ]}
                    >
                      to
                    </Text>

                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() =>
                        dateFilter === 'between' && setShowEndDatePicker(true)
                      }
                      disabled={dateFilter !== 'between'}
                    >
                      <Text
                        style={[
                          styles.dateText,
                          dateFilter !== 'between' && styles.disabledDateText,
                        ]}
                      >
                        {dateFilterRangeValues[1]?.format('MMM D, YYYY') ||
                          'End date'}
                      </Text>
                      <Icon
                        name="calendar-today"
                        size={18}
                        color={
                          dateFilter === 'between'
                            ? Colors.GREEN_DARK
                            : Colors.GRAY
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Date Pickers */}
              {showStartDatePicker && (
                <DateTimePicker
                  value={dateFilterRangeValues[0]?.toDate() || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    setShowStartDatePicker(false)
                    if (date) {
                      setDateFilterRangeValues([
                        dayjs(date),
                        dateFilterRangeValues[1],
                      ])
                    }
                  }}
                />
              )}

              {showEndDatePicker && (
                <DateTimePicker
                  value={dateFilterRangeValues[1]?.toDate() || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    setShowEndDatePicker(false)
                    if (date) {
                      setDateFilterRangeValues([
                        dateFilterRangeValues[0],
                        dayjs(date),
                      ])
                    }
                  }}
                  minimumDate={dateFilterRangeValues[0]?.toDate()}
                />
              )}
            </ScrollView>
          )}

          {activeTab === 1 && (
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dataset Settings</Text>

                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.GREEN_MAIN} />
                    <Text style={styles.loadingText}>Loading datasets...</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.settingGroup}>
                      <Text style={styles.settingLabel}>Dataset</Text>
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => setShowDatasetPicker(true)}
                      >
                        <Text style={styles.selectButtonText}>
                          {selectDatasetValues.find(
                            d => d.id === selectedDataset,
                          )?.name || 'Select dataset'}
                        </Text>
                        <Icon
                          name="keyboard-arrow-down"
                          size={24}
                          color={Colors.GREEN_DARK}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.settingGroup}>
                      <Text style={styles.settingLabel}>Subject Area</Text>
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => setShowSubjectPicker(true)}
                      >
                        <Text style={styles.selectButtonText}>
                          {subjectAreaOptions.find(
                            s => s.value === selectedSubjectID,
                          )?.label || 'Select subject area'}
                        </Text>
                        <Icon
                          name="keyboard-arrow-down"
                          size={24}
                          color={Colors.GREEN_DARK}
                        />
                      </TouchableOpacity>
                    </View>

                    {failedFetchData && (
                      <TouchableOpacity
                        onPress={fetchData}
                        style={styles.retryButton}
                      >
                        <Icon name="refresh" size={20} color={Colors.WHITE} />
                        <Text style={styles.retryButtonText}>Try again</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </ScrollView>
          )}

          {activeTab === 2 && (
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.section}>
                {/* Active Filters Section - Horizontal cards with actions */}
                {filterItems.length > 0 && (
                  <View style={styles.activeFiltersContainer}>
                    <View style={styles.activeFiltersHeader}>
                      <Text style={styles.activeFiltersTitle}>
                        Active Filters ({filterItems.length})
                      </Text>
                      <View style={styles.activeFiltersActions}>
                        <TouchableOpacity
                          style={styles.clearAllButton}
                          onPress={() => {
                            setCrossFilterItems([])
                            setFilterItems([])
                          }}
                        >
                          <Text style={styles.clearAllButtonText}>
                            Clear All
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.activeFiltersScroll}
                    >
                      {filterItems.map(item => (
                        <View key={item.processedID} style={styles.filterCard}>
                          <View style={styles.filterCardHeader}>
                            <Text
                              style={styles.filterCardTitle}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {item.vocabulary?.[0]
                                ? toTitleCase(item.vocabulary[0])
                                : item.label || item.processedID}
                            </Text>
                            <TouchableOpacity
                              style={styles.removeFilterButton}
                              onPress={() => {
                                setCrossFilterItems(
                                  filterItemsRef?.current?.filter(
                                    (fItem: any) =>
                                      fItem.processedID !== item.processedID,
                                  ),
                                )
                                setFilterItems(
                                  filterItemsRef?.current?.filter(
                                    (fItem: any) =>
                                      fItem.processedID !== item.processedID,
                                  ),
                                )
                              }}
                            >
                              <Icon
                                name="close"
                                size={16}
                                color={Colors.WHITE}
                              />
                            </TouchableOpacity>
                          </View>
                          <View style={styles.filterCardContent}>
                            <Filter
                              columnItem={item}
                              removeItemFn={() => {}}
                              addFilterItem={addFilterItem}
                              setLoading={setLoading}
                              compactMode={true}
                            />
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Available Columns Section */}
                <Text style={styles.availableColumnsTitle}>
                  Available Columns
                </Text>
                <View style={styles.columnsContainer}>{ColumnItemsMemo}</View>
              </View>
            </ScrollView>
          )}
        </View>

        {/* Render all picker modals */}
        {renderPeriodPicker()}
        {renderDatasetPicker()}
        {renderSubjectPicker()}
      </Animated.View>
    )
  },
)

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  activeFiltersContainer: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledDateRange: {
    opacity: 1,
  },
  disabledDateText: {
    color: Colors.GRAY,
  },
  orSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  orLine: {
    flex: 1,
    height: 1,
    marginBottom: 10,
    backgroundColor: Colors.GRAY_LIGHT,
  },
  orText: {
    marginBottom: 10,
    marginHorizontal: 10,
    color: Colors.GRAY_DARK,
    fontSize: 14,
  },
  inactiveSelectButton: {
    opacity: 0.6,
    backgroundColor: Colors.GRAY_LIGHT,
  },
  inactiveSelectButtonText: {
    color: Colors.GRAY_DARK,
  },
  customDateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customDateRangeLabel: {
    fontSize: 16,
    color: Colors.GREEN_DARK,
    marginLeft: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
  },
  dateInput: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeFiltersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeFiltersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.GREEN_DARK,
  },
  activeFiltersActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  clearAllButtonText: {
    color: Colors.GREEN_DARK,
    fontSize: 14,
    fontWeight: '600',
  },
  activeFiltersScroll: {
    paddingBottom: 8,
  },
  filterCard: {
    width: 220,
    backgroundColor: Colors.WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
    marginRight: 12,
    overflow: 'hidden',
  },
  filterCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.GREEN_DARK,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterCardTitle: {
    flex: 1,
    fontSize: 14,
    color: Colors.WHITE,
    fontWeight: '600',
    backgroundColor: Colors.GREEN_DARK,
    marginRight: 8,
  },
  removeFilterButton: {
    backgroundColor: Colors.RED,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterCardContent: {
    paddingBottom: 8,
  },
  availableColumnsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.GREEN_DARK,
    marginBottom: 12,
  },
  columnsContainer: {
    marginTop: 8,
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTab: {
    shadowColor: Colors.GREEN_MAIN,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.WHITE,
  },
  inactiveTabText: {
    color: Colors.GREEN_DARK,
  },
  tabContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.GREEN_DARK,
    marginBottom: 16,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  selectButtonText: {
    fontSize: 16,
    color: Colors.GREEN_DARK,
  },
  dateRangeContainer: {
    marginTop: 8,
  },
  dateRangeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: Colors.GREEN_DARK,
  },
  dateSeparator: {
    marginHorizontal: 12,
    color: Colors.GRAY_DARK,
  },
  settingGroup: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 14,
    color: Colors.GRAY_DARK,
    marginBottom: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.GRAY_DARK,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.GREEN_MAIN,
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  retryButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.GREEN_DARK,
    paddingVertical: 12,
  },
  columnsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  selectedItem: {
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unselectedItem: {
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    marginTop: 16,
    color: Colors.GRAY_DARK,
    fontSize: 16,
  },
  itemText: {
    fontSize: 14,
    flexShrink: 1,
  },
  itemIcon: {
    marginLeft: 8,
  },
  pickerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.GREEN_DARK,
  },
  pickerOptions: {
    maxHeight: '70%',
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY_LIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerOptionText: {
    fontSize: 16,
    color: Colors.GREEN_DARK,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    color: Colors.GRAY_DARK,
    fontSize: 16,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    width: '85%',
    maxHeight: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.GREEN_DARK,
  },
  modalScroll: {
    maxHeight: '80%',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: Colors.GREEN_DARK,
    width: 100,
  },
  infoValue: {
    flex: 1,
    color: Colors.GRAY_DARK,
  },
  synonymsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  synonymTag: {
    backgroundColor: Colors.GREEN_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  synonymText: {
    color: Colors.GREEN_DARK,
    fontSize: 12,
  },
})

export default DashboardFilters
