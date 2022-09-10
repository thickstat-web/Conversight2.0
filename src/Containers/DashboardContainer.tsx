import React, { useState } from 'react'
import { FlatList, Platform, StyleSheet } from 'react-native'
import { View } from 'react-native-ui-lib'
import { useTheme, useAppSelector, usePinboardData } from '@/Hooks'
import { DashboardVisualizer, LoadingSpinner } from '@/Components'
import { Colors } from '@/Theme/Variables'
import { PinboardItem, selectConverseData } from '@/Store/App'
import { ConverseData } from '@/Types/ChatMessage'
import { navigate } from '@/Navigators/utils'
import { DATA_EXPLORER } from '@/Constants/screens'

const CARD_HEIGHT = 130

const LoadingCard = () => (
  <View style={[styles.visCard, styles.loading]}>
    <LoadingSpinner size={'small'} />
  </View>
)

const Card = React.memo(({ item }: { item: PinboardItem }) => {
  const { id, loading, isTextCard } = item
  const converseData = useAppSelector(selectConverseData)
  const [move, setMove] = useState(false)

  if (loading) {
    return <LoadingCard />
  }

  const data: ConverseData | null = converseData[id][0]
  if (!data) {
    return null
  }

  return (
    <View
      flex
      style={[styles.visCard, isTextCard && { height: CARD_HEIGHT }]}
      onTouchStart={() => setMove(false)}
      onTouchMove={() => setMove(true)}
      onTouchEnd={() => {
        if (Platform.OS === 'android' || !move) {
          navigate(DATA_EXPLORER, { id: data.id })
        }
      }}
    >
      <DashboardVisualizer data={data} />
    </View>
  )
})

const PinboardComponents = React.memo(
  ({ pinboardComponents }: { pinboardComponents: PinboardItem[] }) => {
    const textCards = pinboardComponents.filter(_ => _.isTextCard)
    const chartAndTableCards = pinboardComponents.filter(_ => !_.isTextCard)
    const renderItem = ({ item }: { item: PinboardItem }) => (
      <Card item={item} />
    )
    const ChartAndTableCards = () =>
      chartAndTableCards.map((item: PinboardItem) => <Card item={item} />)
    return (
      <FlatList
        style={{ margin: 8 }}
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

const DashboardContainer = ({ navigation, route }) => {
  const { pinboardId } = route.params
  const { Layout, Colors } = useTheme()
  const { isLoading, pinboardComponents } = usePinboardData(pinboardId)

  return (
    <View flex style={{ backgroundColor: Colors.WHITE_SMOKE }}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <PinboardComponents pinboardComponents={pinboardComponents} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    justifyContent: 'space-around',
  },
  visCard: {
    margin: 6,
    padding: 12,
    borderRadius: 6,
    backgroundColor: Colors.WHITE,
  },
  loading: {
    height: CARD_HEIGHT,
    // backgroundColor: Colors.NOTIFICATION_GREEN,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.GREEN_DARK,
    textAlign: 'left',
  },
})

export default DashboardContainer
