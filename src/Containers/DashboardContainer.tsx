import React from 'react'
import { FlatList, Pressable, SafeAreaView, StyleSheet } from 'react-native'
import { TouchableOpacity, View, Text } from 'react-native-ui-lib'
import {
  useTheme,
  useAppDispatch,
  useAppSelector,
  usePinboardData,
} from '@/Hooks'
import { LoadingSpinner } from '@/Components'
import { Colors } from '@/Theme/Variables'
import { PinboardItem, selectConverseData } from '@/Store/App'
import { DashboardVisualizer } from '@/Components/Visualization'
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
      onTouchEnd={() => {
        navigate(DATA_EXPLORER, { id: data.id })
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
    const renderItem = ({ item, index }) => <Card item={item} />
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
    <SafeAreaView style={[Layout.fill, { backgroundColor: Colors.GREEN_MAIN }]}>
      <View flex style={{ backgroundColor: Colors.WHITE_SMOKE }}>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <PinboardComponents pinboardComponents={pinboardComponents} />
        )}
      </View>
    </SafeAreaView>
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
