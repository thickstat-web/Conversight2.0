import React from 'react'
import { StyleSheet } from 'react-native'
import { Colors, Text, View } from 'react-native-ui-lib'
import { useTheme } from '@/Hooks'
import ChartContainer from '@/Containers/Chat/ChartContainer'
import TableContainer from '@/Containers/Chat/TableContainer'
import { VisualFormat, ChartType, ConverseData } from '@/Types/ChatMessage'

export const TextContainer = ({ value }: { value: string }) => {
  const { Fonts } = useTheme()
  return (
    <Text
      margin-4
      style={[Fonts.textSmall, styles.message]}
      selectable={true}
      selectionColor={Colors.GREEN_LIGHTEST}
    >
      {value}
    </Text>
  )
}

const getPreferredChart = (
  visualFormats: VisualFormat[],
  utterance: string,
  values: Record<string, any>[],
  visualFormatIncludes: (chart: string) => boolean,
) => {
  let preferredChart: ChartType | null =
    (visualFormats.find(item => item.type.indexOf('Chart') !== -1)
      ?.type as ChartType) ?? null
  const query = utterance?.toLowerCase()

  const isPieChart = () =>
    values.length <= 10 &&
    (query.includes('top') || query.includes('bottom')) &&
    visualFormatIncludes('PieChart')

  const isColumnChart = () =>
    values.length > 10 &&
    values.length < 100 &&
    visualFormatIncludes('ColumnChart')

  const isLineChart = () =>
    (values.length > 1 || query.includes('compare')) &&
    visualFormatIncludes('LineChart')

  const isAreaChart = () =>
    query.includes('compare') && visualFormatIncludes('AreaChart')

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

export const resolveVisualization = (data: ConverseData) => {
  const {
    id,
    columns,
    columnMetadata,
    value,
    values,
    message,
    utterance,
    visualFormats,
  } = data
  const visualFormatIncludes = (chart: string) => {
    return !!visualFormats.find(item => item.type.indexOf(chart) !== -1)
  }

  let content = null
  if (
    visualFormats.length === 0 ||
    visualFormats.find(item => item.type === 'Text' || values.length === 0)
  ) {
    content = <TextContainer value={value} />
  } else if (visualFormatIncludes('Chart') && values.length < 100) {
    let preferredChart: ChartType | null = getPreferredChart(
      visualFormats,
      utterance,
      values,
      visualFormatIncludes,
    )

    content = (
      <ChartContainer
        key={id}
        preferredChart={preferredChart}
        columns={columns}
        columnMetadata={columnMetadata}
        visualFormats={visualFormats}
        values={values}
        title={message}
      />
    )
  } else if (visualFormatIncludes('Table')) {
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

const styles = StyleSheet.create({
  message: {
    fontSize: 14,
    lineHeight: 24,
  },
})
