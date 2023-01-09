import React, { memo, useLayoutEffect, useState } from 'react'
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { ActionSheet, Text, TouchableOpacity, View } from 'react-native-ui-lib'
import Icon from 'react-native-vector-icons/Ionicons'
import { AdaptiveCard, Button, ExpandButton, SearchBar } from '@/Components'
import { useAppSelector, useTheme } from '@/Hooks'
import { properCase } from '@/Utils/common'
import { selectConverseData } from '@/Store/App'
import { ChartType, ConverseData } from '@/Types/ChatMessage'
import TableContainer from './TableContainer'
import ChartContainer from './ChartContainer'
import AdaptiveCardListContainer from './AdaptiveCardListContainer'
import settingsIcon from '@/Assets/Images/xml-svg/settings'
import menuIcon from '@/Assets/Images/xml-svg/menu'
import { Colors } from '@/Theme/Variables'
import { SvgCss } from 'react-native-svg'
import { COLLAPSE_ALL, DEFAULT_ADAPTIVE_CARD_ROWS, EXPAND_ALL } from '@/Config'

type VisualizationTypes = ChartType | 'Table'

interface DataExplorerContainerProps {
  navigation: any
  route: {
    params: {
      id: string
      title: string
      formats: string[]
    }
  }
}

interface LabelOptions {
  label: string
  onPress: (option: VisualizationTypes | undefined) => void
}

const visualizationOptions: Record<Partial<VisualizationTypes>, string> = {
  AreaChart: 'Area Chart',
  BarChart: 'Bar Chart',
  HorizontalBarChart: 'Horizontal Bar Chart',
  DonutChart: 'Donut Chart',
  LineChart: 'Line Chart',
  PieChart: 'Pie Chart',
  Table: 'Table',
}

export type TableOrAdaptiveCardProps = {
  screenWidth: number
  table: boolean
  setTable: (table: boolean) => void
  expandedAll: boolean
  setExpandedAll: (table: boolean) => void
  data: ConverseData
}

const Header = ({ title }: { title: string }) => (
  <View paddingV-8 paddingH-16>
    <Text style={styles.cardTitle}>{properCase(title, true)}</Text>
  </View>
)

const TableOrAdaptiveCard = memo(
  ({
    screenWidth,
    table,
    setTable,
    expandedAll,
    setExpandedAll,
    data,
  }: TableOrAdaptiveCardProps) => {
    const { id, columns, columnMetadata, values } = data
    const [searchText, setSearchText] = useState('')

    const searchTextFilter = (
      row: { [s: string]: unknown } | ArrayLike<unknown>,
    ) => {
      return Object.values(row).some(value =>
        `${value}`.toLowerCase().includes(searchText.trim().toLowerCase()),
      )
    }

    const filteredValues = searchText.trim().length
      ? values.filter(searchTextFilter)
      : values
    //console.log(JSON.stringify(filteredValues, null, 2))
    return (
      <View
        style={{
          backgroundColor: Colors.WHITE,
          paddingHorizontal: 8,
          width: screenWidth,
        }}
      >
        <View style={styles.segmentWrapper}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              table && { backgroundColor: '#f0fcf4' },
            ]}
            onPress={() => setTable(true)}
          >
            <SvgCss
              width="20"
              height="20"
              xml={menuIcon}
              style={{ marginHorizontal: 4 }}
            />
            <Text
              style={{
                color: Colors.GREEN_MAIN,
                fontWeight: table ? '500' : 'normal',
              }}
            >
              Table
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            padding-8
            paddingH-16
            style={[
              styles.segmentButton,
              !table && { backgroundColor: '#f0fcf4' },
            ]}
            onPress={() => setTable(false)}
          >
            <SvgCss
              width="20"
              height="20"
              xml={settingsIcon}
              style={{ marginHorizontal: 4 }}
            />
            <Text
              style={{
                color: Colors.GREEN_MAIN,
                fontWeight: !table ? '500' : 'normal',
              }}
            >
              Card List
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            marginTop: 5,
            paddingBottom: 5,
          }}
        >
          {
            <SearchBar
              searchText={searchText}
              setSearchText={setSearchText}
              placeholderText={'Search values...'}
              selectionColor={Colors.GREEN_LIGHT}
              placeholderTextColor={Colors.DARK}
              cursorColor={Colors.GREEN_LIGHT}
              textColor={Colors.TEXT_BLACK}
              iconColor={Colors.DARK}
              style={{
                marginHorizontal: 2,
                backgroundColor: '#EAFAEA',
                borderColor: 'green',
              }}
            />
          }
        </View>
        {table ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.contentContainer}
            // style={{ width: screenWidth }}
          >
            <TableContainer
              id={id}
              columns={columns}
              columnMetadata={columnMetadata}
              values={filteredValues}
            />
          </ScrollView>
        ) : (
          <>
            {columns.length > DEFAULT_ADAPTIVE_CARD_ROWS && (
              <View row right paddingH-4 paddingV-2>
                <ExpandButton
                  collapsedText={COLLAPSE_ALL}
                  expandedText={EXPAND_ALL}
                  expanded={expandedAll}
                  onPress={() => setExpandedAll(!expandedAll)}
                />
              </View>
            )}
            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              <AdaptiveCardListContainer
                id={id}
                columns={columns}
                columnMetadata={columnMetadata}
                values={filteredValues}
                expandAll={expandedAll}
              />
            </ScrollView>
          </>
        )}
      </View>
    )
  },
)

const DataExplorerContainer = ({
  navigation,
  route,
}: DataExplorerContainerProps) => {
  const { Colors } = useTheme()
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const converseData = useAppSelector(selectConverseData)
  const [visible, setVisible] = useState(false)
  const [table, setTable] = useState(true)
  const ref = React.useRef<any>()
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  const { id, title } = route.params
  const message = converseData[id][0]
  const { columns, columnMetadata, values, visualFormats } = message
  const [visualFormat, setVisualFormat] = useState(visualFormats[0].type)
  const formats: string[] = visualFormats
    .filter(item => item.type in visualizationOptions)
    .map(item => item.type)

  useLayoutEffect(() => {
    if (formats.length > 1) {
      const moreOptionsButton = () => (
        <View style={{ paddingBottom: 2 }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              borderWidth: 1,
              borderColor: Colors.WHITE,
              paddingHorizontal: 16,
              paddingVertical: 5,
              borderRadius: 16,
              alignItems: 'center',
            }}
            onPress={() => setVisible(true)}
          >
            <Text
              style={{
                color: Colors.WHITE,
                fontWeight: table ? '500' : 'normal',
              }}
            >
              {visualizationOptions[visualFormat as VisualizationTypes]}
            </Text>
            <Icon
              style={{ marginLeft: 4 }}
              name="chevron-down-sharp"
              size={20}
              color={Colors.WHITE}
            />
          </TouchableOpacity>
        </View>
      )
      navigation.setOptions({
        headerRight: moreOptionsButton,
      })
    }
  }, [navigation, formats, visualizationOptions, visualFormat])

  const buildOptions = (onPress: (option: string) => void): LabelOptions[] => {
    const labelOptions: LabelOptions[] = formats
      .filter(item => visualizationOptions[item as VisualizationTypes])
      .map(item => ({
        label: visualizationOptions[item as VisualizationTypes],
        onPress: () => onPress(item),
      }))
    return [...labelOptions, { label: 'Cancel', onPress: () => {} }]
  }

  const onSelect = (option: string) => {
    setVisualFormat(option)
    // const index = formats.indexOf(option)
    // // setCurrentSlideIndex(index)
    // ref.current.scrollToIndex({ index })
  }

  const getItemLayout = (data, index) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  })

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const totalWidth = event.nativeEvent.layoutMeasurement.width
    const xPos = event.nativeEvent.contentOffset.x
    const current = Math.floor(xPos / totalWidth)
    setCurrentSlideIndex(current)
  }

  const isSingleRecord = values.length === 1
  const [expandedAll, setExpandedAll] = useState(false)

  const renderItem = ({ item }: { item: string }) => {
    let content = null
    if (isSingleRecord) {
      content = (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.adaptiveCardContainer}
        >
          <AdaptiveCard
            id={id}
            columns={columns}
            columnMetadata={columnMetadata}
            row={values[0]}
            expandAll={false}
            expandable={true}
          />
        </ScrollView>
      )
    } else if (item === 'Table') {
      content = (
        <TableOrAdaptiveCard
          screenWidth={screenWidth}
          table={table}
          setTable={setTable}
          expandedAll={expandedAll}
          setExpandedAll={setExpandedAll}
          data={message}
        />
      )
    } else if (item.indexOf('Chart') !== -1) {
      content = (
        <View
          style={[
            styles.contentContainer,
            styles.chartContainer,
            {
              width: screenWidth,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            <ChartContainer
              key={id}
              preferredChart={item as ChartType}
              columns={columns}
              columnMetadata={columnMetadata}
              visualFormats={visualFormats}
              values={values}
              title={title}
              enableChartPreview={true}
            />
          </ScrollView>
        </View>
      )
    }
    return content
  }

  const keyExtractor = (format: string, index: number) => {
    return `${format}:${index}`
  }

  const scrollPrevious = () => {
    if (currentSlideIndex > 0) {
      ref.current.scrollToIndex({ index: currentSlideIndex - 1 })
    }
  }

  const scrollNext = () => {
    if (currentSlideIndex < formats.length - 1) {
      ref.current.scrollToIndex({ index: currentSlideIndex + 1 })
    }
  }

  const options = buildOptions(onSelect)
  const tableOnly = formats.length === 1
  const containerHeight = screenHeight * (tableOnly ? 1 : 0.81)
  return (
    <View flex style={{ backgroundColor: Colors.WHITE }}>
      {title.length > 0 && <Header title={title} />}
      <View flex-6>
        {visualFormat && renderItem({ item: visualFormat })}
        {/* <FlatList
          data={formats}
          keyboardShouldPersistTaps={'always'}
          ref={ref}
          onMomentumScrollEnd={onScroll}
          contentContainerStyle={
            {
              // height: containerHeight,
            }
          }
          style={{ paddingBottom: 64 }}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          // getItemLayout={!tableOnly ? getItemLayout : undefined}
          horizontal={!tableOnly}
          pagingEnabled={!tableOnly}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
        /> */}
      </View>

      {/* {formats.length > 1 && (
        <View style={styles.dotsContainer}>
          <View style={styles.dotsWrapper}>
            {formats.map((_, index) => {
              const opacity = currentSlideIndex === index ? 1 : 0.2
              return (
                <View
                  key={index}
                  style={{
                    ...styles.dot,
                    opacity,
                  }}
                />
              )
            })}
          </View> */}

      {/* <View row>
            <TouchableOpacity
              onPress={scrollPrevious}
              style={[styles.scrollButton]}
            >
              <BackIcon />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={scrollNext}
              style={[styles.scrollButton, styles.scrollNext]}
            >
              <NextIcon />
            </TouchableOpacity>
          </View> */}
      {/* </View>
      )} */}

      {formats.length > 1 && (
        <ActionSheet
          visible={visible}
          onDismiss={() => setVisible(false)}
          title={'Change KPI'}
          // message={'Message goes here'}
          cancelButtonIndex={options.length - 1}
          useNativeIOS={true}
          dialogStyle={styles.actionSheet}
          options={options}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  moreOptionsButton: { fontSize: 30 },
  contentContainer: {
    backgroundColor: Colors.WHITE,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.GREEN_DARK,
    textAlign: 'center',
  },
  adaptiveCardContainer: {
    paddingBottom: 120,
  },
  chartContainer: {
    justifyContent: 'flex-start',
  },
  dotsContainer: {
    backgroundColor: Colors.WHITE,
    paddingBottom: 32,
    alignItems: 'center',
  },
  dotsWrapper: {
    display: 'flex',
    flexDirection: 'row',
  },
  dot: {
    margin: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00AA39',
  },
  scrollButton: {
    margin: 24,
    marginHorizontal: 80,
    height: 48,
    width: 48,
    paddingTop: 15,
    paddingLeft: 16,
    borderRadius: 25,
    backgroundColor: Colors.GREEN_LIGHTEST,
  },
  scrollNext: {
    paddingLeft: 20,
  },
  actionSheet: { borderRadius: 16 },
  segmentWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 4,
    marginBottom: 2,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#EAFAEA',
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    paddingHorizontal: 16,
  },
  expandall: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
})

export default React.memo(DataExplorerContainer)
