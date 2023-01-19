import React, { useState } from 'react'
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import { View } from 'react-native-ui-lib'
import Icon from 'react-native-vector-icons/Ionicons'
import { useTheme, useAppSelector, usePinboardData } from '@/Hooks'
import { DashboardVisualizer, LoadingSpinner } from '@/Components'
import { Colors } from '@/Theme/Variables'
import { PinboardItem, selectConverseData } from '@/Store/App'
import { ConverseData } from '@/Types/ChatMessage'
import { navigate } from '@/Navigators/utils'
import { DATA_EXPLORER } from '@/Constants/screens'
import { Filter } from '@/Types/Pinboard'
import { buildDashboardFilters, DashboardFilters } from './MyDashboardsHelper'

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
  const [move, setMove] = useState(false)

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
    if (Platform.OS === 'android' || !move) {
      navigate(DATA_EXPLORER, { id: data.id, title })
    }
  }

  return (
    <Pressable
      style={[styles.visCard, isTextCard && { height: CARD_HEIGHT }, style]}
      onPress={isDataEmpty ? null : handleOpenDataExplorer}
      // onTouchStart={isDataEmpty ? null : () => setMove(false)}
      // onTouchMove={isDataEmpty ? null : () => setMove(true)}
      // onTouchEnd={isDataEmpty ? null : handleOpenDataExplorer}
    >
      {!isDataEmpty && (
        <Icon
          style={styles.expandIcon}
          name="expand-outline"
          size={20}
          color={Colors.GREEN_DARK}
        />
      )}
      <DashboardVisualizer data={componentData} enableChartPreview={false} />
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
      chartAndTableCards.map((item: PinboardItem) => <Card item={item} />)
    return (
      <FlatList
        style={{ padding: 6 }}
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

const DashboardContainer = ({ navigation, route }) => {
  const { pinboardId, appliedFilters } = route.params as RouteParams
  const { Colors } = useTheme()
  const { isLoading, pinboardComponents } = usePinboardData(pinboardId)
  const filters = buildDashboardFilters(appliedFilters)

  return (
    <View flex style={{ backgroundColor: Colors.WHITE_SMOKE }}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {filters.length > 0 && <DashboardFilters filters={filters} />}
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
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: Colors.WHITE,
  },
  loading: {
    height: CARD_HEIGHT,
    // backgroundColor: Colors.NOTIFICATION_GREEN,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.GREEN_DARK,
    textAlign: 'left',
  },
  expandIcon: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
})

export default DashboardContainer
