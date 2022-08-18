import React from 'react'
import { StyleSheet } from 'react-native'
import { Colors, Text, View } from 'react-native-ui-lib'
import { useTheme } from '@/Hooks'
import ChartContainer from '@/Containers/Chat/ChartContainer'
import TableContainer from '@/Containers/Chat/TableContainer'
import { ChartType, ConverseData, TextData } from '@/Types/ChatMessage'

export const TextContainer = ({ text }: { text: string }) => {
  const { Fonts } = useTheme()
  return (
    <Text
      margin-4
      style={[Fonts.textSmall, styles.message]}
      selectable={true}
      selectionColor={Colors.GREEN_LIGHTEST}
    >
      {text}
    </Text>
  )
}

export const FormattedTextContainer = ({
  data,
  title,
}: {
  data: TextData
  title: string
}) => {
  const { Colors, Fonts } = useTheme()
  const { prefix, value, suffix } = data
  return (
    <View>
      <Text margin-4 style={[Fonts.textSmall, styles.message]}>
        <Text style={{ color: Colors.GREEN_MAIN, fontSize: 16 }}>{prefix}</Text>
        <Text style={{ color: Colors.DARK, fontSize: 24 }}>{value}</Text>
        <Text style={{ color: Colors.GREEN_MAIN, fontSize: 16 }}>{suffix}</Text>
      </Text>
      <View>
        <Text
          style={{ fontSize: 16, color: 'rgba(0, 68, 56, 0.6)' }}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
    </View>
  )
}

class Visualizer extends React.PureComponent<{ data: ConverseData }> {
  constructor(props: { data: ConverseData }) {
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
      (query.includes('top') || query.includes('bottom')) &&
      this.visualFormatIncludes('PieChart')

    const isColumnChart = () =>
      values.length > 10 &&
      values.length < 100 &&
      this.visualFormatIncludes('ColumnChart')

    const isLineChart = () =>
      (values.length > 1 || query.includes('compare')) &&
      this.visualFormatIncludes('LineChart')

    const isAreaChart = () =>
      query.includes('compare') && this.visualFormatIncludes('AreaChart')

    if (isPieChart()) {
      preferredChart = 'PieChart'
    } else if (isColumnChart()) {
      preferredChart = 'ColumnChart'
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

export class ChatVisualizer extends Visualizer {
  constructor(props: { data: ConverseData }) {
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
      content = <TextContainer text={textData.value} />
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
        />
      )
    } else if (this.isTable()) {
      content = (
        <TableContainer
          columns={columns}
          columnMetadata={columnMetadata}
          values={values.slice(0, 5)}
        />
      )
    }
    return content
  }
}

export class DashboardVisualizer extends Visualizer {
  constructor(props: { data: ConverseData }) {
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
      content = <FormattedTextContainer data={textData} title={message} />
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
        />
      )
    } else if (this.isTable()) {
      content = (
        <TableContainer
          columns={columns}
          columnMetadata={columnMetadata}
          values={values.slice(0, 5)}
        />
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
  // darkGreen: {
  //   color: rgba(0, 68, 56, 0.6),
  // },
})
