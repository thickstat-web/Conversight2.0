import React, { useEffect, useState } from 'react'
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { ActionSheet, Text, TouchableOpacity, View } from 'react-native-ui-lib'
import { useTranslation } from 'react-i18next'
import { Button } from '@/Components'
import { useAppDispatch, useAppSelector, useTheme } from '@/Hooks'
import { properCase } from '@/Utils/common'
import { selectChatMessages, selectConverseData } from '@/Store/App'
import { ChartType } from '@/Types/ChatMessage'
import TableContainer from './TableContainer'
import ChartContainer from './ChartContainer'
import BackIcon from '@/Assets/Images/drawer/play-back.svg'
import NextIcon from '@/Assets/Images/drawer/play-forward.svg'
import { Colors } from '@/Theme/Variables'

type VisualizationTypes = ChartType | 'Table'

interface DataExplorerContainerProps {
  navigation: any
  route: {
    params: {
      id: string
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
  ColumnChart: 'Column Chart',
  DonutChart: 'Donut Chart',
  LineChart: 'Line Chart',
  PieChart: 'Pie Chart',
  Table: 'Table',
}

const DataExplorerContainer = ({
  navigation,
  route,
}: DataExplorerContainerProps) => {
  const { t } = useTranslation()
  const { Layout, Colors, Common, Fonts } = useTheme()
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  // const messages = useAppSelector(selectChatMessages)
  const converseData = useAppSelector(selectConverseData)
  const [visible, setVisible] = useState(false)
  const ref = React.useRef<any>()
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  const { id } = route.params
  const message = converseData[id][0]
  const {
    columns,
    columnMetadata,
    values,
    message: title,
    visualFormats,
  } = message
  const formats: string[] = visualFormats
    .filter(item => item.type in visualizationOptions)
    .map(item => item.type)

  React.useLayoutEffect(() => {
    if (formats.length > 1) {
      const moreOptionsButton = () => (
        <View style={{ paddingBottom: 2 }}>
          <Button
            label="..."
            onPress={() => setVisible(true)}
            labelStyle={styles.moreOptionsButton}
          />
        </View>
      )
      navigation.setOptions({
        headerRight: moreOptionsButton,
      })
    }
  }, [navigation, formats])

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
    const index = formats.indexOf(option)
    // setCurrentSlideIndex(index)
    ref.current.scrollToIndex({ index })
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

  const renderItem = ({ item }: { item: string }) => {
    let content = null
    if (item === 'Table') {
      content = (
        <View
          style={[
            styles.contentContainer,
            {
              width: screenWidth,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.contentContainer}
            style={{ width: screenWidth }}
          >
            <TableContainer
              id={id}
              columns={columns}
              columnMetadata={columnMetadata}
              values={values.slice(0, 200)}
            />
          </ScrollView>
        </View>
      )
    } else if (item.indexOf('Chart') !== -1) {
      content = (
        <View
          style={[
            styles.contentContainer,
            {
              justifyContent: 'flex-start',
              width: screenWidth,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
            style={{ width: screenWidth }}
          >
            <ChartContainer
              key={id}
              preferredChart={item as ChartType}
              columns={columns}
              columnMetadata={columnMetadata}
              visualFormats={visualFormats}
              values={values}
              title={title}
            />
          </ScrollView>
        </View>
      )
    }
    return content
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

  const Header = () => (
    <View paddingV-8 paddingH-16>
      <Text style={Fonts.textSmall}>{properCase(title, true)}</Text>
    </View>
  )

  const options = buildOptions(onSelect)
  const tableOnly = formats.length === 1
  const containerHeight = screenHeight * (tableOnly ? 0.8 : 0.7)
  return (
    <View flex style={{ backgroundColor: Colors.WHITE }}>
      <View flex-6 marginT-8 center>
        {title.length > 0 && <Header />}
        <FlatList
          data={formats}
          ref={ref}
          onMomentumScrollEnd={onScroll}
          contentContainerStyle={{ height: containerHeight }}
          showsHorizontalScrollIndicator={false}
          getItemLayout={getItemLayout}
          horizontal={!tableOnly}
          pagingEnabled
          renderItem={renderItem}
        />
      </View>

      {formats.length > 1 && (
        <View
          flex-1
          style={{
            backgroundColor: Colors.WHITE,
            paddingTop: 24,
            alignItems: 'center',
          }}
        >
          <View style={styles.dotsContainer}>
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
          </View>

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
        </View>
      )}

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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 8,
  },
  dotsContainer: {
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
})

export default React.memo(DataExplorerContainer)
