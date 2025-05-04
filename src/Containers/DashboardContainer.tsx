import React, { useRef, useState } from 'react'
import {
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
  ViewStyle,
  TouchableOpacity,
} from 'react-native'
import { View, Text, Button } from 'react-native-ui-lib'
import Icon from 'react-native-vector-icons/Ionicons'
import {
  useTheme,
  useAppSelector,
  usePinboardData,
  useAppDispatch,
} from '@/Hooks'
import { DashboardVisualizer, LoadingSpinner } from '@/Components'
import { Colors } from '@/Theme/Variables'
import { PinboardItem, selectConverseData } from '@/Store/App'
import { ConverseData } from '@/Types/ChatMessage'
import { navigate } from '@/Navigators/utils'
import { DATA_EXPLORER } from '@/Constants/screens'
import { Filter } from '@/Types/Pinboard'
import { buildDashboardFilters, DashboardFilters } from './MyDashboardsHelper'
import DashboardFilter from './DashboardFilter'
import { useFetchPinboardsQuery } from '@/Services/modules/bot'

const CARD_HEIGHT = 130

const LoadingCard = () => (
  <View style={[styles.visCard, styles.loading]}>
    <LoadingSpinner size={'small'} />
  </View>
)

type CardProps = {
  item: PinboardItem
  style: ViewStyle
}

const Card = React.memo(({ item, style }: CardProps) => {
  const { id, title, loading, isTextCard } = item
  const converseData = useAppSelector(selectConverseData)

  if (loading) {
    return <LoadingCard />
  }

  const data: ConverseData | null = converseData[id][0]
  if (!data) {
    return null
  }
  const componentData = { ...data, message: title }

  let isDataEmpty: boolean = false
  isDataEmpty = data?.visualFormats.length === 0 || data.values.length === 0

  const handleOpenDataExplorer = () => {
    navigate(DATA_EXPLORER, { id: data.id, title })
  }

  return (
    <Pressable
      style={[styles.visCard, isTextCard && { height: CARD_HEIGHT }, style]}
      onPress={isDataEmpty ? null : handleOpenDataExplorer}
    >
      <DashboardVisualizer
        data={componentData}
        enableChartPreview={false}
        enableResetButton={false}
      />
    </Pressable>
  )
})

const PinboardComponents = React.memo(
  ({ pinboardComponents }: { pinboardComponents: PinboardItem[] }) => {
    const textCards = pinboardComponents.filter(_ => _.isTextCard)
    const chartAndTableCards = pinboardComponents.filter(_ => !_.isTextCard)
    const renderItem = ({ item }: { item: PinboardItem }) => (
      <Card item={item} style={{ marginHorizontal: 4 }} />
    )
    const ChartAndTableCards = () =>
      chartAndTableCards.map((item: PinboardItem) => (
        <Card key={item.id} item={item} style={{ marginHorizontal: 4 }} />
      ))
    return (
      <FlatList
        style={{ padding: 2 }}
        contentContainerStyle={{ paddingBottom: 48 }}
        numColumns={2}
        columnWrapperStyle={styles.row}
        data={textCards}
        renderItem={renderItem}
        ListFooterComponent={ChartAndTableCards}
        showsVerticalScrollIndicator={false}
      />
    )
  },
)

type RouteParams = {
  pinboardId: string
  appliedFilters: Filter[]
}

const DashboardContainer = ({ route }: any) => {
  const { pinboardId, appliedFilters } = route.params as RouteParams
  const { Colors } = useTheme()
  const filters = buildDashboardFilters(appliedFilters)
  const [crossRetainFilter, setCrossRetainFilter] = useState([])
  const retainFiltersRef = useRef<any>(null)
  const { data } = useFetchPinboardsQuery()
  const [payload, setPayload] = useState<{
    retainFilters?: any
    pinboardId?: string
  }>({
    pinboardId,
  })

  const { isLoading, pinboardComponents } = usePinboardData(payload)

  const [modalVisible, setModalVisible] = useState(false)

  const runReport = async () => {
    try {
      const retainFilters = retainFiltersRef.current?.getRetainFilters()
      const pinComponents = data?.data?.find(item => item?.id === pinboardId)
      if (!pinComponents) {
        console.warn('No pin components found for pinboardID:', pinboardId)
        return
      }
      setPayload({
        retainFilters,
        pinboardId,
      })
    } catch (error) {
      console.error('Error in runReport:', error)
    }
  }

  const toggleFilterModal = () => {
    retainFiltersRef.current?.getRetainFilters()
    setModalVisible(!modalVisible)
    runReport()
  }

  return (
    <View flex style={{ backgroundColor: Colors.WHITE_SMOKE }}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {filters.length > 0 && (
            <DashboardFilters
              filters={filters}
              toggleFilterModal={toggleFilterModal}
            />
          )}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={toggleFilterModal}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Filter Options</Text>
                  <TouchableOpacity onPress={toggleFilterModal}>
                    <Icon name="close" size={26} color={Colors.GREEN_DARK} />
                  </TouchableOpacity>
                </View>

                {filters.length > 0 ? (
                  <DashboardFilter
                    pinboardID={pinboardId}
                    itemsVisible={true}
                    closeFn={toggleFilterModal}
                    crossRetainFilter={crossRetainFilter}
                    retainFiltersRef={retainFiltersRef}
                  />
                ) : (
                  <Text style={styles.noFiltersText}>No filters available</Text>
                )}

                <View style={styles.modalFooter}>
                  <Button
                    label="Apply"
                    onPress={toggleFilterModal}
                    backgroundColor={Colors.GREEN_DARK}
                    style={styles.applyButton}
                  />
                </View>
              </View>
            </View>
          </Modal>

          <PinboardComponents pinboardComponents={pinboardComponents} />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: 6,
  },
  row: {
    flex: 1,
    justifyContent: 'space-around',
  },
  visCard: {
    flex: 1,
    marginVertical: 4,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: Colors.WHITE,
    minWidth: '48%',
  },
  loading: {
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    height: 200,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    width: '100%',
    height: '90%',
    maxHeight: '80%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.GREEN_DARK,
  },
  modalFooter: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.LIGHT_GRAY,
    paddingTop: 12,
  },
  applyButton: {
    borderRadius: 8,
    height: 48,
  },
  noFiltersText: {
    textAlign: 'center',
    color: Colors.GRAY,
    marginVertical: 20,
  },
})

export default DashboardContainer
