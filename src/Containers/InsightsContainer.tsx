import React from 'react'
import { FlatList, SafeAreaView, StyleSheet } from 'react-native'
import { View, Text } from 'react-native-ui-lib'
import { useTheme, useAppSelector, useInsightsData } from '@/Hooks'
import { LoadingSpinner, DashboardVisualizer } from '@/Components'
import { Colors } from '@/Theme/Variables'
import { selectConverseData } from '@/Store/App'
import { ConverseData } from '@/Types/ChatMessage'
import { InsightComponent, InsightData } from '@/Types/Insights'
import { DATA_EXPLORER } from '@/Constants/screens'
import { navigate } from '@/Navigators/utils'

const CARD_HEIGHT = 180

const LoadingCard = () => (
  <View style={[styles.visCard, styles.loading]}>
    <LoadingSpinner size={'small'} />
  </View>
)

interface CardProps {
  item: InsightComponent
  insightsData: InsightData[]
}

const Card = React.memo(({ item, insightsData }: CardProps) => {
  const { id, followupLoading } = item
  const converseData = useAppSelector(selectConverseData)

  const data: ConverseData | null = converseData[id]
    ? converseData[id][0]
    : null
  const insightDataItem = insightsData.find(itm => itm.id === id)

  return (
    <View
      flex
      style={[styles.visCard]}
      onTouchEnd={() => {
        navigate(DATA_EXPLORER, { id: data.id })
      }}
    >
      <View>
        <Text>{insightDataItem?.answer}</Text>
      </View>
      {followupLoading ? (
        <LoadingCard />
      ) : data ? (
        <DashboardVisualizer data={data} />
      ) : null}
    </View>
  )
})

interface InsightComponentsProps {
  isLoading: boolean
  followupLoading: boolean
  insightsComponents: InsightComponent[]
  insightsData: InsightData[]
  hasMoreFollowupComponent: boolean
  loadMoreFollowupComponent: () => void
}

interface ListRenderItemProps {
  item: InsightComponent
  index: number
}

const InsightComponents = React.memo((props: InsightComponentsProps) => {
  const {
    insightsComponents,
    insightsData,
    hasMoreFollowupComponent,
    loadMoreFollowupComponent,
  } = props

  const renderItem = ({ item }: ListRenderItemProps) => (
    <Card item={item} insightsData={insightsData} />
  )
  return (
    <FlatList
      style={{ margin: 8 }}
      contentContainerStyle={{ paddingBottom: 48 }}
      data={insightsComponents}
      renderItem={renderItem}
      onEndReached={hasMoreFollowupComponent ? loadMoreFollowupComponent : null}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
    />
  )
})

const InsightsContainer = () => {
  const { Layout, Colors } = useTheme()
  const props = useInsightsData()
  const { isLoading } = props

  return (
    <SafeAreaView style={[Layout.fill, { backgroundColor: Colors.GREEN_MAIN }]}>
      <View flex marginB-10 style={{ backgroundColor: Colors.WHITE_SMOKE }}>
        {isLoading ? <LoadingSpinner /> : <InsightComponents {...props} />}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  visCard: {
    margin: 6,
    padding: 12,
    borderRadius: 6,
    backgroundColor: Colors.WHITE,
  },
  loading: {
    height: CARD_HEIGHT,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.GREEN_DARK,
    textAlign: 'left',
  },
})

export default InsightsContainer
