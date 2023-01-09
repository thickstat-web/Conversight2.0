import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { View, Text } from 'react-native-ui-lib'
import { formatDistance } from 'date-fns'
import Icon from 'react-native-vector-icons/Ionicons'
import {
  useTheme,
  useAppSelector,
  useInsightsData,
  PlayerState,
  useAudioPlayer,
} from '@/Hooks'
import { LoadingSpinner, InsightsVisualizer, WebExplorer } from '@/Components'
import { Colors } from '@/Theme/Variables'
import { selectConverseData, selectUrlFollowupData } from '@/Store/App'
import { ConverseData } from '@/Types/ChatMessage'
import { InsightComponent, InsightData } from '@/Types/Insights'
import { DATA_EXPLORER, WEB_EXPLORER } from '@/Constants/screens'
import { navigate } from '@/Navigators/utils'
import { properCase } from '@/Utils/common'
import { VIEW_ALL } from '@/Config'
import { AudioTrack } from '@/Hooks/helper'
import { URLFollowupData } from '@/Types/Common'

const CARD_HEIGHT = 180

export type ViewToken = {
  item: any
  key: string
  index?: number
  // indicates whether this item is viewable or not
  isViewable: boolean
  section?: any
}

export type ViewableItemsProps = {
  viewableItems: Array<ViewToken>
  changed: Array<ViewToken>
}

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
        paddingT-8
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

function calculateTimeAgo(timestamp: number | undefined) {
  let timeAgo = null
  try {
    timeAgo = formatDistance(new Date(timestamp ?? new Date()), new Date(), {
      addSuffix: true,
    })
  } catch (err) {}
  return timeAgo
}

interface CardProps {
  item: InsightComponent
  insightsData: InsightData[]
  fetchFollowup: (insightComponentIds: string[]) => Promise<void>
}

const Card = React.memo(({ item, insightsData, fetchFollowup }: CardProps) => {
  const { id, followupLoading, type } = item
  const converseData = useAppSelector(selectConverseData)
  const urlFollowupData = useAppSelector(selectUrlFollowupData)

  useEffect(() => {
    if (followupLoading && type === 'ConverseData') {
      fetchFollowup([id])
    }
  }, [followupLoading, id, type, fetchFollowup])

  let data: ConverseData | URLFollowupData | null = null

  let timeAgo: string | null = null
  let title: string = ''
  let explorerUrl: string = ''
  if (type === 'ConverseData' && converseData[id]) {
    data = converseData[id][0] as ConverseData
    timeAgo = calculateTimeAgo(data?.createdAt)
    title = data?.message
  } else if (type === 'WebURL' && urlFollowupData[id]) {
    data = urlFollowupData[id] as URLFollowupData
    const { explorerURL, thumbnailURL } = data
    explorerUrl = explorerURL.length ? explorerURL : thumbnailURL
  }

  const insightDataItem = insightsData.find(itm => itm.id === id)

  const handleOpenExplorer = () => {
    if (type === 'ConverseData') {
      navigate(DATA_EXPLORER, { id, title })
    } else {
      navigate(WEB_EXPLORER, { url: explorerUrl })
    }
  }

  return (
    <View style={styles.visCard}>
      <Pressable
        disabled={followupLoading ? true : false}
        style={{ flex: 1, flexDirection: 'row', padding: 4 }}
        onPress={handleOpenExplorer}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {properCase(insightDataItem?.answer ?? '', true)}
          </Text>
          {timeAgo && (
            <Text style={styles.timeAgo}>{properCase(timeAgo, true)}</Text>
          )}
        </View>
        {followupLoading ? (
          <View style={{ position: 'absolute', right: 8, top: 8 }}>
            <LoadingSpinner size={'small'} />
          </View>
        ) : (
          <Icon
            style={styles.icon}
            name="expand-outline"
            size={20}
            color={Colors.GREEN_DARK}
          />
        )}
      </Pressable>
      {followupLoading ? (
        <LoadingCard />
      ) : type === 'ConverseData' && data ? (
        <InsightsVisualizer
          data={data as ConverseData}
          enableChartPreview={false}
        />
      ) : type === 'WebURL' && data ? (
        <View style={{ height: 250 }}>
          <WebExplorer url={explorerUrl} loaderSize={'small'} />
        </View>
      ) : null}
    </View>
  )
})

interface InsightComponentsProps {
  isLoading: boolean
  loadingInsightsAudio: boolean
  followupLoading: boolean
  insightsComponents: InsightComponent[]
  insightsData: InsightData[]
  insightsAudioList: AudioTrack[]
  fetchFollowup: (insightComponentIds: string[]) => Promise<void>
  playserState: PlayerState
  trackIndex: number
  play: () => Promise<void>
  pausePlayer: () => Promise<void>
  addAudioTracks: (audioTracks: AudioTrack[]) => Promise<void>
  playTrackByIndex: (index: number) => Promise<void>
}

interface ListRenderItemProps {
  item: InsightComponent
  index: number
}

const InsightComponents = React.memo((props: InsightComponentsProps) => {
  const { Colors, Fonts } = useTheme()
  const flatListRef = useRef<FlatList<InsightComponent>>()

  const {
    insightsComponents,
    insightsData,
    fetchFollowup,
    trackIndex,
    pausePlayer,
  } = props

  useEffect(() => {
    if (
      flatListRef &&
      flatListRef.current &&
      trackIndex > 0 &&
      trackIndex < insightsComponents.length
    ) {
      flatListRef.current.scrollToIndex({ index: trackIndex })
    }
  }, [trackIndex, insightsComponents])

  const renderItem = useCallback(
    ({ item }: ListRenderItemProps) => (
      <Card
        item={item}
        insightsData={insightsData}
        fetchFollowup={fetchFollowup}
      />
    ),
    [insightsData, fetchFollowup],
  )

  const handleScrollToIndexFailure = ({ index }: { index: number }) => {
    console.log(
      `[InsightsContainer] trying to scroll to item index ${index} that is not rendered yet`,
    )
  }

  const NoInsights = (
    <View flex center marginT-150>
      <Text style={Fonts.textSmall}>No insights data available</Text>
    </View>
  )

  return (
    <FlatList
      style={{ flex: 1 }}
      ref={flatListRef}
      contentContainerStyle={styles.insightsContainer}
      data={insightsComponents}
      renderItem={renderItem}
      // viewabilityConfig={viewabilityConfig}
      // onViewableItemsChanged={handleOnViewableItemsChanged}
      // onEndReached={hasMoreFollowupComponent ? loadMoreFollowupComponent : null}
      // onEndReachedThreshold={0.5}
      onScrollBeginDrag={pausePlayer}
      onScrollToIndexFailed={handleScrollToIndexFailure}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={NoInsights}
    />
  )
})

const InsightsContainer = ({ navigation }) => {
  const { Layout, Colors } = useTheme()
  const props = useInsightsData()
  const {
    loadingInsightsAudio,
    isLoading,
    insightsComponents,
    insightsData,
    insightsAudioList,
  } = props

  const {
    addAudioTracks,
    play,
    playTrackByIndex,
    pause,
    playerState,
    trackIndex,
  } = useAudioPlayer()

  const [filteredTags, setFilteredTags] = useState<string[]>([])

  const handleTagFilter = async (filters: string[]) => {
    await pause()
    setFilteredTags(filters)
  }

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

  const playButton = useCallback(() => {
    return (
      <TouchableOpacity style={{ marginTop: 4, marginRight: 16 }}>
        {loadingInsightsAudio && <ActivityIndicator color={Colors.WHITE} />}
      </TouchableOpacity>
    )
  }, [loadingInsightsAudio, Colors.WHITE])

  useLayoutEffect(() => {
    navigation.setOptions({ headerRight: playButton })
  }, [navigation, playButton])

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

  const [focused, setFocused] = useState(true)
  useEffect(() => {
    const initPlayer = async () => {
      await addAudioTracks(insightsAudioList)
      await play()
    }
    if (!loadingInsightsAudio && insightsAudioList.length && focused) {
      initPlayer()
    }
  }, [loadingInsightsAudio, insightsAudioList, play, addAudioTracks, focused])

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', async () => {
      setFocused(false)
    })
    return unsubscribe
  }, [navigation, pause])

  return (
    <View flex marginB-10 style={{ backgroundColor: Colors.WHITE_SMOKE }}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {insightsData.length > 4 && (
            <TagFilter
              tagWithIndexes={tagWithIds}
              count={insightsData.length}
              onFilter={handleTagFilter}
            />
          )}
          <InsightComponents
            {...props}
            playserState={playerState}
            trackIndex={trackIndex}
            addAudioTracks={addAudioTracks}
            play={play}
            pausePlayer={pause}
            playTrackByIndex={playTrackByIndex}
            insightsComponents={filteredInsightsComponents}
          />
        </>
      )}
    </View>
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
  icon: {
    padding: 4,
    paddingLeft: 8,
  },
  insightsContainer: {
    paddingBottom: 48,
  },
})

export default InsightsContainer
