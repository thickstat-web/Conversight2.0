import React, { useCallback, useMemo, useState } from 'react'
import { FlatList, Pressable, SectionList, StyleSheet } from 'react-native'
import { TouchableOpacity, View, Text } from 'react-native-ui-lib'
import { formatDistance } from 'date-fns'
import { useTheme } from '@/Hooks'
import { LoadingSpinner, SearchBar } from '@/Components'
import { useFetchPinboardsQuery } from '@/Services/modules/bot'
import { Pinboard } from '@/Types/Pinboard'
import { Colors } from '@/Theme/Variables'
import { properCase } from '@/Utils/common'
import { DASHBOARD_SCREEN } from '@/Constants/screens'
import {
  ATHENA,
  DEFAULT_DASHBOARD_SHOW_COUNT,
  MY_DASHBOARD,
  SHARED,
  VIEW_ALL,
} from '@/Config'

interface TagProps {
  tag: string
  remaining?: boolean
}

interface SectionProps {
  section: { title: string; data: Pinboard[] }
}

interface SectionDataProps {
  title: string
  data: Pinboard[]
}

const ITEM_HEIGHT = 160

const CardTag = ({ tag, remaining = false }: TagProps) => {
  const { Fonts } = useTheme()
  return (
    <View
      style={[styles.tagWrapper, remaining && styles.tagRemainingContainer]}
    >
      <Text
        style={[Fonts.textSmall, styles.tag, remaining && styles.tagRemaining]}
      >
        {`${remaining ? '+' : ''}${properCase(tag)}`}
      </Text>
    </View>
  )
}

const PinboardCard = React.memo(
  ({
    pinboard,
    onTapItem,
  }: {
    pinboard: Pinboard
    onTapItem: (text: Pinboard) => void
  }) => {
    const { Fonts } = useTheme()
    const { name, ownedByName, tags, updatedAt } = pinboard
    const sharedBoard = ownedByName !== undefined && ownedByName !== null

    // For Getting Unique Tags From Duplicate
    const uniqTags = Array.from(new Set(tags))

    const showTags = 3
    let renderedTags = null
    if (uniqTags.length > 0) {
      renderedTags = uniqTags
        .slice(0, showTags)
        .map((tag, index) => <CardTag key={`${index}`} tag={tag} />)

      // Render remaining count tag
      if (uniqTags.length > showTags) {
        renderedTags.push(
          <CardTag
            key={`${uniqTags.length}`}
            tag={`${uniqTags.length - showTags}`}
            remaining={true}
          />,
        )
      }
    }

    let timeAgo = null
    try {
      timeAgo = formatDistance(new Date(updatedAt ?? new Date()), new Date(), {
        addSuffix: true,
      })
    } catch (err) {}

    return (
      <TouchableOpacity
        marginB-16
        marginH-16
        onPress={() => onTapItem(pinboard)}
        style={styles.pinboard}
      >
        <View flex>
          <Text style={[Fonts.textSmal, styles.boardname]} numberOfLines={1}>
            {name}
          </Text>
          {timeAgo && <Text marginV-4>Last updated {timeAgo}</Text>}
          {sharedBoard && (
            <Text style={[Fonts.textSmal, styles.sharedBy]}>
              Shared by {ownedByName}
            </Text>
          )}
        </View>
        <View row>
          <View flex row style={styles.tasContainer}>
            {renderedTags}
          </View>
        </View>
      </TouchableOpacity>
    )
  },
)

const TagFilter = React.memo(
  ({
    tagWithIndexes,
    count,
    onFilter,
  }: {
    tagWithIndexes: Record<string, number[]>
    count: number
    onFilter: (tags: string[]) => void
  }) => {
    const { Colors, Fonts } = useTheme()
    const [filterTags, setFilterTags] = useState<string[]>([])

    const allTagNames = Object.keys(tagWithIndexes)
    const filterDefault = allTagNames.filter(
      tag => ![ATHENA, MY_DASHBOARD, SHARED].includes(tag),
    )

    const excludeTags: string[] = []
    const athenaTagExists = allTagNames.includes(ATHENA)
    if (!athenaTagExists) {
      excludeTags.push(ATHENA)
    }
    const sharedTagExists = allTagNames.includes(SHARED)
    if (!sharedTagExists) {
      excludeTags.push(SHARED)
    }
    let allTags = [VIEW_ALL, ATHENA, MY_DASHBOARD, SHARED, ...filterDefault]
    allTags = allTags.filter(tag => !excludeTags.includes(tag))

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
      const tagsCount =
        tag === VIEW_ALL ? count : tagWithIndexes[tag]?.length ?? 0
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

const renderItem =
  (onTapItem: (text: Pinboard) => void) =>
  ({ item, index }: { item: Pinboard; index: number }) => {
    return <PinboardCard pinboard={item} onTapItem={onTapItem} />
  }

const filterDashboardsBySearchText = (
  dashboards: Pinboard[],
  searchText: string,
) => {
  const searchTextFilter = ({ name }: Pinboard) =>
    name.toLowerCase().match(searchText.trim().toLowerCase())

  return searchText.trim().length
    ? dashboards.filter(searchTextFilter)
    : dashboards
}

const MyDashboardsContainer = ({ navigation }) => {
  const { Colors, Fonts } = useTheme()
  const { data, isLoading } = useFetchPinboardsQuery()
  const [filteredTags, setFilteredTags] = useState<string[]>([])
  const [searchText, setSearchText] = useState('')

  const pinboards = useMemo(() => data?.data ?? [], [data?.data])
  const showSearchBox = pinboards.length >= DEFAULT_DASHBOARD_SHOW_COUNT

  // Group list of pinbord indexes by tag
  const tagWithIndexes = useMemo(() => {
    const tmpTagWithIndexes: Record<string, number[]> = {}
    pinboards.forEach((pinboard: Pinboard, index: number) => {
      pinboard.tags.forEach((item: string) => {
        const tag = item.trim().toLowerCase()
        if (tag.length > 0) {
          if (!tmpTagWithIndexes[tag]) {
            tmpTagWithIndexes[tag] = []
          }
          tmpTagWithIndexes[tag].push(index)
        }
      })
    })
    return tmpTagWithIndexes
  }, [pinboards])

  // Prepare section data
  let sectionData: Array<SectionDataProps>
  if (filteredTags.length === 0) {
    const item: SectionDataProps = {
      title: 'All Dashboards',
      data: filterDashboardsBySearchText(pinboards, searchText),
    }
    sectionData = [item]
  } else {
    sectionData = filteredTags
      .map(tag => ({
        title: tag,
        data: filterDashboardsBySearchText(
          tagWithIndexes[tag].map(index => pinboards[index]),
          searchText,
        ),
      }))
      .filter(({ data: items }) => items.length > 0)
  }

  const onTapItem = useCallback(
    (item: Pinboard) => {
      const { id, name, appliedFilters } = item
      // console.log(`[DashboardContainer] open dashboard: ${name}`)
      navigation.navigate(DASHBOARD_SCREEN, {
        pinboardId: id,
        appliedFilters,
      })
    },
    [navigation],
  )

  const keyExtractor = (item: Pinboard, index: number) => {
    return `${index}:${item.id}`
  }

  const renderSection = ({ section: { title, data } }: SectionProps) => {
    // console.log(`[DashboardContainer] renderSection title: ${title}`)
    return (
      <View style={styles.sectionHeader}>
        <Text style={[Fonts.textSmall]}>
          {properCase(title)}
          <Text style={{ color: Colors.GREEN_MAIN }}> ({data.length})</Text>
        </Text>
      </View>
    )
  }

  const getItemLayout = (data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })

  const NoDashbord = (
    <View flex center marginT-150>
      <Text style={Fonts.textSmall}>No dashboard available</Text>
    </View>
  )

  return (
    <View flex style={{ backgroundColor: Colors.WHITE }}>
      {showSearchBox && (
        <View
          style={{
            paddingBottom: 8,
            backgroundColor: Colors.GREEN_MAIN,
          }}
        >
          <SearchBar
            searchText={searchText}
            setSearchText={setSearchText}
            placeholderText={'Search dashboards...'}
            selectionColor={Colors.GREEN_LIGHT}
            placeholderTextColor={Colors.GREEN_LIGHTEST}
            cursorColor={Colors.WHITE}
            textColor={Colors.WHITE}
            iconColor={Colors.WHITE}
            style={{
              marginHorizontal: 16,
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderColor: 'green',
            }}
          />
        </View>
      )}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {pinboards.length > 4 && (
            <TagFilter
              tagWithIndexes={tagWithIndexes}
              count={pinboards.length}
              onFilter={setFilteredTags}
            />
          )}
          <SectionList
            contentContainerStyle={styles.cardsContainer}
            sections={sectionData}
            renderSectionHeader={renderSection}
            keyExtractor={keyExtractor}
            renderItem={renderItem(onTapItem)}
            showsVerticalScrollIndicator={false}
            getItemLayout={getItemLayout}
            ListEmptyComponent={NoDashbord}
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
  sectionHeader: {
    padding: 16,
    backgroundColor: Colors.WHITE,
  },
  pinboard: {
    height: ITEM_HEIGHT,
    backgroundColor: Colors.NOTIFICATION_GREEN,
    borderRadius: 8,
    padding: 20,
  },
  boardname: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  sharedBy: {
    lineHeight: 20,
    color: Colors.GREEN_LIGHTEST2,
  },
  tasContainer: {
    overflow: 'hidden',
    flexGrow: 1,
  },
  tagWrapper: {
    marginRight: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: Colors.WHITE,
  },
  tagRemainingContainer: {
    backgroundColor: Colors.GREEN_MAIN,
  },
  tag: {
    fontSize: 12,
    lineHeight: 22,
    color: Colors.DARK,
  },
  tagRemaining: {
    color: Colors.WHITE,
    fontWeight: 'bold',
  },
  cardsContainer: {
    paddingBottom: 48,
  },
})

export default MyDashboardsContainer
