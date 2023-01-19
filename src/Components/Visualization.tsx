import React from 'react'
import { StyleSheet } from 'react-native'
import { Text, View } from 'react-native-ui-lib'
import { useTheme } from '@/Hooks'
import { AdaptiveCard } from '@/Components'
import ChartContainer from '@/Containers/Chat/ChartContainer'
import TableContainer from '@/Containers/Chat/TableContainer'
import { ChartType, ConverseData, TextData } from '@/Types/ChatMessage'
import { Colors } from '@/Theme/Variables'
import { ScrollView } from 'react-native-gesture-handler'

export const InsightsTextContainer = ({ data }: { data: TextData }) => {
  const { Fonts } = useTheme()
  const { prefix, value, suffix } = data
  const displayValue = `${prefix}${value} ${suffix}`.trim()
  return (
    <Text
      margin-4
      style={[Fonts.textSmall, styles.message]}
      selectable={true}
      selectionColor={Colors.GREEN_LIGHTEST}
    >
      {displayValue}
    </Text>
  )
}

export const TextContainer = ({ data }: { data: TextData }) => {
  const { Fonts } = useTheme()
  const { prefix, abbrValue, suffix } = data
  const displayValue = `${prefix}${abbrValue} ${suffix}`.trim()
  return (
    <View padding-4>
      <Text
        style={[Fonts.textSmall, styles.message]}
        selectable={true}
        selectionColor={Colors.GREEN_LIGHTEST}
      >
        {displayValue}
      </Text>
    </View>
  )
}

export const DashboardTextContainer = ({
  data,
  title,
  isError,
}: {
  data: TextData
  title: string
  isError: boolean
}) => {
  const { Colors, Fonts } = useTheme()
  const { prefix, abbrValue, suffix } = data
  return (
    <View>
      <Text margin-4 style={[Fonts.textSmall, styles.message]}>
        <Text style={{ color: Colors.GREEN_MAIN, fontSize: 16 }}>{prefix}</Text>
        <Text style={{ color: Colors.DARK, fontSize: 18, fontWeight: 'bold' }}>
          {abbrValue}
        </Text>
        <Text style={{ color: Colors.GREEN_MAIN, fontSize: 16 }}>{suffix}</Text>
      </Text>
      <View>
        <Text
          style={{ fontSize: 16, color: 'rgba(0, 68, 56, 0.6)' }}
          numberOfLines={1}
        >
          {isError ? '' : title}
        </Text>
      </View>
    </View>
  )
}

interface VisualizerProps {
  data: ConverseData
  enableChartPreview: boolean
}

class Visualizer extends React.PureComponent<VisualizerProps> {
  constructor(props: VisualizerProps) {
    super(props)
  }

  private visualFormatIncludes(type: string) {
    const { visualFormats } = this.props.data
    return !!visualFormats.find(item => item.type.indexOf(type) !== -1)
  }

  isText() {
    const { visualFormats, values } = this.props.data
    return (
      visualFormats.length === 0 ||
      visualFormats.find(item => item.type === 'Text' || values.length === 0)
    )
  }

  isChart() {
    const { values } = this.props.data
    return this.visualFormatIncludes('Chart') && values.length < 100
  }

  isAdaptiveCard() {
    const { values } = this.props.data
    return this.visualFormatIncludes('Table') && values.length === 1
  }

  isTable() {
    return this.visualFormatIncludes('Table')
  }

  getPreferredChart() {
    const { values, utterance, visualFormats } = this.props.data

    let preferredChart: ChartType | null =
      (visualFormats.find(item => item.type.indexOf('Chart') !== -1)
        ?.type as ChartType) ?? null
    const query = utterance?.toLowerCase()

    const isPieChart = () =>
      values.length <= 10 &&
      // (query.includes('top') || query.includes('bottom')) &&
      this.visualFormatIncludes('PieChart')

    const isBarChart = () =>
      values.length > 10 &&
      values.length < 100 &&
      this.visualFormatIncludes('BarChart')

    const isLineChart = () =>
      (values.length > 1 || query.includes('compare')) &&
      this.visualFormatIncludes('LineChart')

    const isAreaChart = () =>
      query.includes('compare') && this.visualFormatIncludes('AreaChart')

    if (isPieChart()) {
      preferredChart = 'PieChart'
    } else if (isBarChart()) {
      preferredChart = 'BarChart'
    } else if (isLineChart()) {
      preferredChart = 'LineChart'
    } else if (isAreaChart()) {
      preferredChart = 'AreaChart'
      // } else if (visualFormatIncludes('DualAxes')) {
      //   preferredChart = 'DualAxes'
    }

    return preferredChart
  }
}

export class InsightsVisualizer extends Visualizer {
  constructor(props: VisualizerProps) {
    super(props)
  }

  render(): React.ReactNode {
    const {
      id,
      columns,
      columnMetadata,
      textData,
      values,
      message,
      visualFormats,
    } = this.props.data
    const enableChartPreview = this.props.enableChartPreview

    let content = null
    if (this.isText()) {
      content = <InsightsTextContainer data={textData} />
    } else if (this.isChart()) {
      content = (
        <ChartContainer
          key={id}
          preferredChart={this.getPreferredChart()}
          columns={columns}
          columnMetadata={columnMetadata}
          visualFormats={visualFormats}
          values={values}
          title={message}
          enableChartPreview={enableChartPreview}
        />
      )
    } else if (this.isAdaptiveCard()) {
      content = (
        <View marginH-6>
          <AdaptiveCard
            id={id}
            columns={columns}
            columnMetadata={columnMetadata}
            row={values[0]}
            expandable={false}
            expandAll={false}
          />
        </View>
      )
    } else if (this.isTable()) {
      const renderSize = 5
      const total = values.length
      content = (
        <View marginH-6>
          <ScrollView
            horizontal={true}
            contentContainerStyle={styles.columnDirection}
            showsHorizontalScrollIndicator={false}
          >
            <TableContainer
              id={id}
              columns={columns}
              columnMetadata={columnMetadata}
              values={values.slice(0, renderSize)}
            />
          </ScrollView>
          {total > renderSize && (
            <View style={styles.bottomCountWrapper}>
              <Text style={styles.bottomCount}>
                Showing {renderSize} of {total} rows
              </Text>
            </View>
          )}
        </View>
      )
    }
    return content
  }
}

export class DashboardVisualizer extends Visualizer {
  constructor(props: VisualizerProps) {
    super(props)
  }

  render(): React.ReactNode {
    const {
      id,
      columns,
      columnMetadata,
      textData,
      values,
      message,
      visualFormats,
      isError,
    } = this.props.data
    const enableChartPreview = this.props.enableChartPreview

    let content = null
    if (this.isText()) {
      content = (
        <DashboardTextContainer
          data={textData}
          title={message}
          isError={isError}
        />
      )
    } else if (this.isChart()) {
      content = (
        <>
          <Text style={styles.cardTitle}>{message}</Text>
          <ChartContainer
            key={id}
            preferredChart={this.getPreferredChart()}
            columns={columns}
            columnMetadata={columnMetadata}
            visualFormats={visualFormats}
            values={values}
            title={message}
            enableChartPreview={enableChartPreview}
          />
        </>
      )
    } else if (this.isAdaptiveCard()) {
      content = (
        <View marginH-6>
          <AdaptiveCard
            id={id}
            columns={columns}
            columnMetadata={columnMetadata}
            row={values[0]}
            expandable={false}
            expandAll={false}
          />
        </View>
      )
    } else if (this.isTable()) {
      const renderSize = 5
      const total = values.length
      content = (
        <View marginH-6>
          <Text style={styles.cardTitle}>{message}</Text>
          <ScrollView
            horizontal={true}
            contentContainerStyle={styles.columnDirection}
            showsHorizontalScrollIndicator={false}
          >
            <TableContainer
              id={id}
              columns={columns}
              columnMetadata={columnMetadata}
              values={values.slice(0, renderSize)}
            />
          </ScrollView>
          {total > renderSize && (
            <View style={styles.bottomCountWrapper}>
              <Text style={styles.bottomCount}>
                Showing {renderSize} of {total} rows
              </Text>
            </View>
          )}
        </View>
      )
    }
    return content
  }
}

export class ChatVisualizer extends Visualizer {
  constructor(props: VisualizerProps) {
    super(props)
  }

  render(): React.ReactNode {
    const {
      id,
      columns,
      columnMetadata,
      textData,
      values,
      message,
      visualFormats,
    } = this.props.data

    let content = null
    if (this.isText()) {
      content = <TextContainer data={textData} />
    } else if (this.isChart()) {
      content = (
        <ChartContainer
          key={id}
          preferredChart={this.getPreferredChart()}
          columns={columns}
          columnMetadata={columnMetadata}
          visualFormats={visualFormats}
          values={values}
          title={message}
          enableChartPreview={false}
        />
      )
    } else if (this.isAdaptiveCard()) {
      content = (
        <AdaptiveCard
          id={id}
          columns={columns}
          columnMetadata={columnMetadata}
          row={values[0]}
          expandable={false}
          expandAll={false}
        />
      )
    } else if (this.isTable()) {
      const renderSize = 5
      const total = values.length
      content = (
        <>
          <ScrollView horizontal={true}>
            <TableContainer
              id={id}
              columns={columns}
              columnMetadata={columnMetadata}
              values={values.slice(0, renderSize)}
            />
          </ScrollView>
          {total > renderSize && (
            <View style={styles.bottomCountWrapper}>
              <Text style={styles.bottomCount}>
                Showing {renderSize} of {total} rows
              </Text>
            </View>
          )}
        </>
      )
    }
    return content
  }
}

const styles = StyleSheet.create({
  message: {
    fontSize: 14,
    lineHeight: 24,
  },
  cardTitle: {
    marginHorizontal: 6,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.GREEN_DARK,
    textAlign: 'left',
  },
  columnDirection: {
    flexDirection: 'column',
  },
  bottomCountWrapper: {
    paddingVertical: 6,
    paddingLeft: 4,
  },
  bottomCount: {
    color: Colors.GREEN_MAIN,
  },
})
