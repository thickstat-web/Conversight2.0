import React, { useState } from 'react'
import { FlatList, Pressable, SafeAreaView, StyleSheet } from 'react-native'
import { View, Text } from 'react-native-ui-lib'
import { formatDistance } from 'date-fns'
import { useTheme, useAppSelector, useInsightsData } from '@/Hooks'
import { LoadingSpinner, InsightsVisualizer } from '@/Components'
import { Colors } from '@/Theme/Variables'
import { selectConverseData } from '@/Store/App'
import { ConverseData } from '@/Types/ChatMessage'
import { InsightComponent, InsightData } from '@/Types/Insights'
import { DATA_EXPLORER } from '@/Constants/screens'
import { navigate } from '@/Navigators/utils'
import { properCase } from '@/Utils/common'
import { VIEW_ALL } from '@/Config'

const CARD_HEIGHT = 180

const LoadingCard = () => (
  <View style={[styles.visCard, styles.loading]}>
    <LoadingSpinner size={'small'} />
  </View>
)

const TagFilter = React.memo(
  ({
    tagWithIndexes,
    count,
    onFilter,
  }: {
    tagWithIndexes: Record<string, string[]>
    count: number
    onFilter: (tags: string[]) => void
  }) => {
    const { Colors, Fonts } = useTheme()
    const [filterTags, setFilterTags] = useState<string[]>([])
    const allTags = [VIEW_ALL, ...Object.keys(tagWithIndexes)]

    const renderTag = ({ item: tag }: { item: string }) => {
      const toggleTagSelection = () => {
        setFilterTags(prevTags => {
          let tags: string[] = []
          if (tag === VIEW_ALL) {
            tags = []
          } else if (prevTags.includes(tag)) {
            tags = prevTags.filter(item => item !== tag)
          } else {
            prevTags.push(tag)
            tags = allTags.filter(item => prevTags.includes(item))
          }
          onFilter(tags)
          return [...tags]
        })
      }

      const selected =
        (filterTags.length === 0 && tag === VIEW_ALL) ||
        filterTags.includes(tag)
      const tagsCount = tag === VIEW_ALL ? count : tagWithIndexes[tag].length

      return (
        <Pressable
          onPress={toggleTagSelection}
          style={[styles.filterTag, selected && styles.selectedTagWrapper]}
        >
          <Text style={[Fonts.textSmall, selected && { color: Colors.WHITE }]}>
            {properCase(tag)}
            <Text style={styles.tagText}> ({tagsCount})</Text>
          </Text>
        </Pressable>
      )
    }

    return (
      <View
        paddingT-4
        paddingB-8
        paddingH-16
        style={{ backgroundColor: Colors.WHITE }}
      >
        <FlatList
          data={allTags}
          showsHorizontalScrollIndicator={false}
          horizontal
          extraData={tagWithIndexes}
          keyExtractor={tag => tag}
          renderItem={renderTag}
        />
      </View>
    )
  },
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

  let timeAgo = null
  try {
    timeAgo = formatDistance(
      new Date(data?.createdAt ?? new Date()),
      new Date(),
      {
        addSuffix: true,
      },
    )
  } catch (err) {}

  return (
    <View
      flex
      style={[styles.visCard]}
      onTouchEnd={() => {
        navigate(DATA_EXPLORER, { id: data.id })
      }}
    >
      <View>
        <Text style={styles.cardTitle}>
          {properCase(insightDataItem?.answer ?? '', true)}
        </Text>
        {timeAgo && (
          <Text style={styles.timeAgo}>{properCase(timeAgo, true)}</Text>
        )}
      </View>
      {followupLoading ? (
        <LoadingCard />
      ) : data ? (
        <InsightsVisualizer data={data} />
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
  const { Colors, Fonts } = useTheme()
  const {
    insightsComponents,
    insightsData,
    hasMoreFollowupComponent,
    loadMoreFollowupComponent,
  } = props

  const renderItem = ({ item }: ListRenderItemProps) => (
    <Card item={item} insightsData={insightsData} />
  )

  const NoInsights = (
    <View flex center marginT-150>
      <Text style={Fonts.textSmall}>No insights data available</Text>
    </View>
  )

  return (
    <FlatList
      style={{ flex: 1 }}
      contentContainerStyle={styles.insightsContainer}
      data={insightsComponents}
      renderItem={renderItem}
      onEndReached={hasMoreFollowupComponent ? loadMoreFollowupComponent : null}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={NoInsights}
    />
  )
})

const InsightsContainer = () => {
  const { Layout, Colors } = useTheme()
  const props = useInsightsData()
  const { isLoading, insightsComponents, insightsData } = props
  const [filteredTags, setFilteredTags] = useState<string[]>([])

  // Group list of insight indexes by tag
  const tagWithIds: Record<string, string[]> = {}
  insightsData.forEach((insight: InsightData) => {
    insight.tags.forEach((item: string) => {
      const tag = item.trim().toLowerCase()
      if (tag.length > 0) {
        if (!tagWithIds[tag]) {
          tagWithIds[tag] = []
        }
        tagWithIds[tag].push(insight.id)
      }
    })
  })

  // useEffect(() => {
  //   console.log('')
  //   console.log(`[Insights] tags: ${JSON.stringify(tagWithIds)}`)
  //   console.log(`[Insights] filteredTags: ${JSON.stringify(filteredTags)}`)

  //   console.log('')
  //   const componentIds = insightsComponents.map(_ => _.id)
  //   console.log(`[Insights] component ids: ${JSON.stringify(componentIds)}`)
  //   const dataIds = insightsData.map(_ => _.id)
  //   console.log(`[Insights] insight data ids: ${JSON.stringify(dataIds)}`)
  // })

  // Prepare filtered Insights Data
  let filteredInsightsComponents: Array<InsightComponent>
  if (filteredTags.length === 0) {
    filteredInsightsComponents = insightsComponents
  } else {
    const uniqIds = new Set(filteredTags.flatMap(tag => tagWithIds[tag]))
    filteredInsightsComponents = insightsComponents.filter(item =>
      uniqIds.has(item.id),
    )
  }

  return (
    <SafeAreaView style={[Layout.fill]}>
      <View flex marginB-10 style={{ backgroundColor: Colors.WHITE_SMOKE }}>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {insightsData.length > 4 && (
              <TagFilter
                tagWithIndexes={tagWithIds}
                count={insightsData.length}
                onFilter={setFilteredTags}
              />
            )}
            <InsightComponents
              {...props}
              insightsComponents={filteredInsightsComponents}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  filterTag: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 4,
  },
  tagText: { color: Colors.GRAY_DARK, paddingLeft: 8 },
  selectedTagWrapper: {
    backgroundColor: Colors.GREEN_DARK,
    borderRadius: 8,
  },
  selectedTagText: {
    color: Colors.WHITE,
  },
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
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.GREEN_DARK,
    textAlign: 'left',
    paddingBottom: 4,
  },
  timeAgo: {
    color: Colors.GRAY_DARK,
    paddingBottom: 8,
  },
  insightsContainer: {
    paddingBottom: 48,
  },
})

export default InsightsContainer
