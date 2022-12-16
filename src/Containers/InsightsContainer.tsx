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
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { View, Text } from 'react-native-ui-lib'
import { formatDistance } from 'date-fns'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { SvgCss } from 'react-native-svg'
import { pauseXML } from '@/Assets/Images/xml-svg/pause'
import { playXML } from '@/Assets/Images/xml-svg/play'
import {
  useTheme,
  useAppSelector,
  useInsightsData,
  PlayerState,
  useAudioPlayer,
} from '@/Hooks'
import { LoadingSpinner, InsightsVisualizer } from '@/Components'
import { Colors } from '@/Theme/Variables'
import { selectConverseData } from '@/Store/App'
import { ConverseData } from '@/Types/ChatMessage'
import { InsightComponent, InsightData } from '@/Types/Insights'
import { DATA_EXPLORER } from '@/Constants/screens'
import { navigate } from '@/Navigators/utils'
import { debounce, properCase } from '@/Utils/common'
import { VIEW_ALL } from '@/Config'
import { AudioTrack } from '@/Hooks/helper'

const CARD_HEIGHT = 180

export type ViewToken = {
  item: any
  key: string
  index?: number
  // indicated whether this item is viewable or not
  isViewable: boolean
  section?: any
}

export type ViewableItemsProps = {
  viewableItems: Array<ViewToken>
  changed: Array<ViewToken>
}

// const addUpdatedTracks =
//   (
//     viewableItems: ViewToken[],
//     callback: (index: number) => void | Promise<void>,
//   ) =>
//   () => {
//     let startIndex = 0
//     if (viewableItems.length && viewableItems[0]?.index) {
//       startIndex = viewableItems[0].index
//     }
//     viewableItems.forEach(_ => {
//       if (_.index && _.index < startIndex) {
//         startIndex = _.index
//       }
//     })

//     debounce(() => callback(startIndex), 500)
//   }

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

interface CardProps {
  item: InsightComponent
  insightsData: InsightData[]
  fetchFollowup: (insightComponentIds: string[]) => Promise<void>
}

const Card = React.memo(({ item, insightsData, fetchFollowup }: CardProps) => {
  const { id, followupLoading } = item
  const converseData = useAppSelector(selectConverseData)
  const [move, setMove] = useState(false)

  useEffect(() => {
    if (followupLoading) {
      fetchFollowup([id])
    }
  }, [followupLoading, id, fetchFollowup])

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
      style={styles.visCard}
      // onTouchStart={() => setMove(false)}
      // onTouchMove={() => setMove(true)}
      // onTouchEnd={() => {
      //   if (Platform.OS === 'android' || !move) {
      //     // navigate(DATA_EXPLORER, { id: data?.id, title: data?.message })
      //   }
      // }}
    >
      <View>
        <Pressable
          style={{ flex: 1, flexDirection: 'row' }}
          onPress={() =>
            navigate(DATA_EXPLORER, { id: data?.id, title: data?.message })
          }
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              {properCase(insightDataItem?.answer ?? '', true)}
            </Text>
            {timeAgo && (
              <Text style={styles.timeAgo}>{properCase(timeAgo, true)}</Text>
            )}
          </View>
          <MaterialCommunityIcons
            name="text-box-search-outline"
            color={Colors.GREEN_MAIN}
            size={25}
          />
        </Pressable>
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
  loadingInsightsAudio: boolean
  followupLoading: boolean
  insightsComponents: InsightComponent[]
  insightsData: InsightData[]
  insightsAudioList: AudioTrack[]
  // hasMoreFollowupComponent: boolean
  // loadMoreFollowupComponent: () => void
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
    // insightsAudioList,
    // loadingInsightsAudio,
    // hasMoreFollowupComponent,
    // loadMoreFollowupComponent,
    fetchFollowup,
    // playserState,
    trackIndex,
    // play,
    pausePlayer,
    // addAudioTracks,
    // playTrackByIndex,
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

  // useEffect(() => {
  //   const insightIds = new Set(insightsComponents.map(_ => _.id))
  //   const filteredAudioTracks = insightsAudioList.filter(_ =>
  //     insightIds.has(_.id),
  //   )
  //   const updateAudioTracks = async () => {
  //     await addAudioTracks(filteredAudioTracks)
  //     console.log('[InsightComponents] updateAudioTracks - audio track updated')
  //   }

  //   if (filteredAudioTracks.length) {
  //     updateAudioTracks()
  //   }
  // }, [insightsComponents, insightsAudioList, addAudioTracks, play, pausePlayer])

  // const viewabilityConfig = useMemo(
  //   () => ({
  //     minimumViewTime: 1000,
  //     waitForInteraction: true,
  //     // viewAreaCoveragePercentThreshold: 60,
  //     itemVisiblePercentThreshold: 60,
  //   }),
  //   [],
  // )

  // const handleOnViewableItemsChanged = useCallback(
  //   ({ viewableItems }: ViewableItemsProps) => {
  //     debounce(addUpdatedTracks(viewableItems, playTrackByIndex), 500)
  //   },
  // )

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
    // const isPlayable =
    //   playerState === PlayerState.IDLE ||
    //   playerState === PlayerState.PAUSED ||
    //   playerState === PlayerState.STOPPED
    return (
      <TouchableOpacity
        style={{ marginTop: 4, marginRight: 16 }}
        // onPress={isPlayable ? play : pause}
      >
        {loadingInsightsAudio && <ActivityIndicator color={Colors.WHITE} />}
        {/* {loadingInsightsAudio || playerState === PlayerState.LOADING ? (
          <ActivityIndicator color={Colors.WHITE} />
        ) : (
          <SvgCss
            width="32"
            height="32"
            xml={isPlayable ? playXML : pauseXML}
          />
        )} */}
      </TouchableOpacity>
    )
  }, [loadingInsightsAudio, Colors.WHITE])
  // }, [playerState, play, pause, loadingInsightsAudio, Colors.WHITE])

  useLayoutEffect(() => {
    navigation.setOptions({ headerRight: playButton })
  }, [navigation, playButton])

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

  // const filteredAudioTracks = useMemo(() => {
  //   const insightIds = new Set(filteredInsightsComponents.map(_ => _.id))
  //   return insightsAudioList.filter(_ => insightIds.has(_.id))
  // }, [filteredInsightsComponents, insightsAudioList])

  // useEffect(() => {
  //   const initPlayer = async () => {
  //     // await addAudioTracks(filteredAudioTracks)
  //   }
  //   if (filteredAudioTracks.length) {
  //     initPlayer()
  //   }
  // }, [filteredAudioTracks, addAudioTracks])

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
  insightsContainer: {
    paddingBottom: 48,
  },
})

export default InsightsContainer
