import React, { useEffect, useState } from 'react'
import {
  FlatList,
  Pressable,
  SafeAreaView,
  SectionList,
  StyleSheet,
} from 'react-native'
import { TouchableOpacity, View, Text } from 'react-native-ui-lib'
import { useTranslation } from 'react-i18next'
import { useTheme, useAppDispatch, useAppSelector } from '@/Hooks'
import { LoadingSpinner, LayoutNoInternet } from '@/Components'
import { useFetchPinboardsQuery } from '@/Services/modules/bot'
import { Pinboard } from '@/Types/Pinboard'
import { Colors } from '@/Theme/Variables'
import { properCase } from '@/Utils/common'

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
  const { Gutters, Layout, Colors, Common, Fonts } = useTheme()
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

const PinboardCard = ({
  pinboard,
  onTapItem,
}: {
  pinboard: Pinboard
  onTapItem: (text: Pinboard) => void
}) => {
  const { Gutters, Layout, Colors, Common, Fonts } = useTheme()
  const { name, ownedByName, tags } = pinboard
  const sharedBoard = ownedByName !== undefined && ownedByName !== null

  const showTags = 3
  let renderedTags = null
  if (tags.length > 0) {
    renderedTags = tags
      .slice(0, showTags)
      .map((tag, index) => <CardTag key={`${index}`} tag={tag} />)

    // Render remaining count tag
    if (tags.length > showTags) {
      renderedTags.push(
        <CardTag
          key={`${tags.length}`}
          tag={`${tags.length - showTags}`}
          remaining={true}
        />,
      )
    }
  }

  return (
    <TouchableOpacity
      marginB-16
      marginH-16
      onPress={() => onTapItem(pinboard)}
      style={styles.pinboard}
    >
      <View flex>
        <Text style={[Fonts.textSmal, styles.boardname]}>{name}</Text>
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
}

const TagFilter = ({
  tagWithIndexes,
  count,
  onFilter,
}: {
  tagWithIndexes: Record<string, number[]>
  count: number
  onFilter: (tags: string[]) => void
}) => {
  const VIEW_ALL = 'view all'
  const MY_DASHBOARD = 'my dashboard'
  const SHARED = 'shared'
  const { Colors, Fonts } = useTheme()
  const [filterTags, setFilterTags] = useState<string[]>([])

  const tagsExclMyDashboardShared = Object.keys(tagWithIndexes).filter(
    tag => ![MY_DASHBOARD, SHARED].includes(tag),
  )
  const allTags = [VIEW_ALL, MY_DASHBOARD, SHARED, ...tagsExclMyDashboardShared]

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
      (filterTags.length === 0 && tag === VIEW_ALL) || filterTags.includes(tag)
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
    <View paddingT-12 paddingH-16 style={{ backgroundColor: Colors.WHITE }}>
      <FlatList
        data={allTags}
        showsHorizontalScrollIndicator={false}
        horizontal
        extraData={`${filterTags.length}`}
        keyExtractor={tag => tag}
        renderItem={renderTag}
      />
    </View>
  )
}

const renderItem =
  (onTapItem: (text: Pinboard) => void) =>
  ({ item }: { item: Pinboard }) =>
    <PinboardCard pinboard={item} onTapItem={onTapItem} />

const DashboardContainer = () => {
  const { t } = useTranslation()
  const { Gutters, Layout, Colors, Common, Fonts } = useTheme()
  // const dispatch = useAppDispatch()
  const { data, isLoading } = useFetchPinboardsQuery()
  const pinboards = data?.data || []
  const [filteredTags, setFilteredTags] = useState<string[]>([])

  // Group list of pinbord indexes by tag
  const tagWithIndexes: Record<string, number[]> = {}
  pinboards.forEach((pinboard: Pinboard, index: number) => {
    pinboard.tags.forEach((item: string) => {
      const tag = item.trim().toLowerCase()
      if (tag.length > 0) {
        if (!tagWithIndexes[tag]) {
          tagWithIndexes[tag] = []
        }
        tagWithIndexes[tag].push(index)
      }
    })
  })

  // Prepare section data
  const sectionData: Array<SectionDataProps> = []
  if (filteredTags.length === 0) {
    const item: SectionDataProps = {
      title: 'All Dashboards',
      data: pinboards,
    }
    sectionData.push(item)
  } else {
    filteredTags.forEach(tag => {
      const item: SectionDataProps = {
        title: tag,
        data: tagWithIndexes[tag].map(index => pinboards[index]),
      }
      sectionData.push(item)
    })
  }

  const onTapItem = (item: Pinboard) => {}
  const keyExtractor = (item: Pinboard) => item.id
  const renderSection = ({ section: { title, data } }: SectionProps) => (
    <View style={styles.sectionHeader}>
      <Text style={[Fonts.textSmall]}>
        {properCase(title)}
        <Text style={{ color: Colors.GREEN_MAIN }}> ({data.length})</Text>
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={[Layout.fill, { backgroundColor: Colors.GREEN_MAIN }]}>
      <View flex style={{ backgroundColor: Colors.WHITE }}>
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
              getItemLayout={(data, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
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
    paddingVertical: 5,
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

export default DashboardContainer
