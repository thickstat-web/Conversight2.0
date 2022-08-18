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

  const title = data.message
  return (
    <View style={[styles.visCard, !isTextCard && { height: 350 }]}>
      <View marginV-4>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <DashboardVisualizer data={data} />
    </View>
  )
})

const PinboardComponents = ({ pinboardComponents }) => {
  const textCards = pinboardComponents.filter(_ => _.isTextCard)
  const chartOrTableCards = pinboardComponents.filter(_ => !_.isTextCard)
  const renderItem = ({ item, index }) => <Card item={item} />
  const Footer = () =>
    chartOrTableCards.map((item: PinboardItem) => <Card item={item} />)
  return (
    <FlatList
      style={{ margin: 8 }}
      numColumns={2} // set number of columns
      columnWrapperStyle={styles.row} // space them out evenly
      data={textCards}
      // keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListFooterComponent={Footer}
      showsVerticalScrollIndicator={false}
    />
  )
}

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
    // flex: 1,
    // alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    marginVertical: 8,
    padding: 12,
    height: 130,
    borderRadius: 6,
    backgroundColor: Colors.WHITE,
  },
  loading: {
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
