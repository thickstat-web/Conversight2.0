import React, { useEffect, useState } from 'react'
import {
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { ActionSheet, Text, TouchableOpacity, View } from 'react-native-ui-lib'
import { useTranslation } from 'react-i18next'
import { Button } from '@/Components'
import { useAppDispatch, useAppSelector, useTheme } from '@/Hooks'
import { selectChatMessages } from '@/Store/App'
import { AthenaMessage, ChartType } from '@/Types/ChatMessage'
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
  const { width: screenWidth } = useWindowDimensions()
  const messages = useAppSelector(selectChatMessages)
  const [visible, setVisible] = useState(false)
  const ref = React.useRef<any>()
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  const { id } = route.params
  const message = messages.find(item => item.id === id) as AthenaMessage
  const {
    columns,
    columnMetadata,
    values,
    message: title,
    visualFormats,
  } = message
  const formats = visualFormats
    .filter(item => item.type in visualizationOptions)
    .map(item => item.type)

  React.useLayoutEffect(() => {
    const moreOptionsButton = () => (
      <Button
        label="..."
        onPress={() => setVisible(true)}
        labelStyle={styles.moreOptionsButton}
      />
    )
    navigation.setOptions({
      headerRight: moreOptionsButton,
    })
  }, [navigation])

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
    // console.log(`[DataExplorerContainer] option: ${option}`)
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
            contentContainerStyle={styles.contentContainer}
            style={{ width: screenWidth }}
          >
            <TableContainer
              columns={columns}
              columnMetadata={columnMetadata}
              values={values.slice(0, 100)}
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
              width: screenWidth,
            },
          ]}
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

  const options = buildOptions(onSelect)
  return (
    <SafeAreaView style={[Layout.fill, { backgroundColor: Colors.GREEN_MAIN }]}>
      <View flex style={{ backgroundColor: Colors.WHITE }}>
        <View flex-3 marginT-8 center>
          <FlatList
            data={formats}
            ref={ref}
            onMomentumScrollEnd={onScroll}
            // contentContainerStyle={{ height: screenHeight * 0.68 }}
            showsHorizontalScrollIndicator={false}
            getItemLayout={getItemLayout}
            horizontal
            pagingEnabled
            renderItem={renderItem}
          />
        </View>
        <View flex-2 center style={{ backgroundColor: Colors.WHITE }}>
          {formats.length > 1 && (
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
          )}

          <View row>
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
          </View>
        </View>

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
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  moreOptionsButton: { fontSize: 30 },
  contentContainer: {
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
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

export default DataExplorerContainer
