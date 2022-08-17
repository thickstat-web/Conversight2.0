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
import { resolveVisualization } from '@/Components/Visualization'
import { ConverseData } from '@/Types/ChatMessage'

const LoadingCard = () => (
  <View style={[styles.visCard]}>
    <LoadingSpinner size={'small'} />
  </View>
)

const Card = React.memo(({ item }: { item: PinboardItem }) => {
  const { id, loading, isTextCard } = item
  const converseData = useAppSelector(selectConverseData)

  if (loading) {
    return <LoadingCard />
  }

  let data: ConverseData | null = null
  data = converseData[id][0]
  if (!data) {
    return null
  }
  return (
    <View style={[styles.visCard, !isTextCard && { height: 300 }]}>
      {resolveVisualization(data)}
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
  const { Gutters, Layout, Colors, Common, Fonts } = useTheme()
  const { isLoading, pinboardComponents } = usePinboardData(pinboardId)

  return (
    <SafeAreaView style={[Layout.fill, { backgroundColor: Colors.GREEN_MAIN }]}>
      <View flex style={{ backgroundColor: Colors.WHITE }}>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    height: 130,
    borderRadius: 6,
    backgroundColor: Colors.NOTIFICATION_GREEN,
  },
})

export default DashboardContainer
