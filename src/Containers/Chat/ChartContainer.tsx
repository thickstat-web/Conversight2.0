import React from 'react'
import { Dimensions, StyleSheet, useWindowDimensions } from 'react-native'
import { Text, View } from 'react-native-ui-lib'
import {
  VictoryArea,
  VictoryPie,
  VictoryBar,
  VictoryLine,
  VictoryChart,
  VictoryLabel,
  VictoryTheme,
  VictoryAxis,
  VictoryLegend,
  VictoryContainer,
  VictoryZoomContainer,
} from 'victory-native'
import numeral from 'numeral'
import { useTheme } from '@/Hooks'
import { Colors } from '@/Theme/Variables'
import { ColumnMetadata } from '@/Types/ChatHistory'
import { ChartType, VisualFormat } from '@/Types/ChatMessage'
import { properCase } from '@/Utils/common'

interface ChartProps {
  xAxisLabel: string
  yAxisLabel: string
  xAxisField: string
  yAxisField: string
  values: Array<Record<string, number>>
}

interface PieChartProps extends ChartProps {
  innerRadious: number
}

interface BarChartProps extends ChartProps {
  horizontal: boolean
}

interface ChartContainerProps {
  preferredChart: ChartType | null
  title: string
  columns: string[]
  columnMetadata: ColumnMetadata
  visualFormats: VisualFormat[]
  values: Array<Record<string, any>>
}

interface LegendName {
  name: string
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const colorScale = [
  '#D9F0EB',
  '#66E992',
  '#27DC61',
  '#78D196',
  '#00AA39',
  '#069577',
  '#E5ECEB',
  '#A1E7D9',
  '#6BCEBA',
  '#A5D6CC',
  '#95B3BD',
  '#CCDAD7',
  '#B3C7C3',
  '#99B4AF',
  '#80A19C',
  '#014E40',
]

const PieChart = ({
  xAxisField,
  yAxisField,
  innerRadious = 0,
  values,
}: PieChartProps) => {
  const { Colors, Fonts } = useTheme()
  const { width: screenWidth } = useWindowDimensions()
  let total = 0.0
  let legendNames: LegendName[] = []
  values.forEach(item => {
    total += item[xAxisField]
    const name = {
      name: `${item[yAxisField]} (${numeral(
        (item[xAxisField] * 100) / total,
      ).format('0')}%)`,
    }
    legendNames.push(name)
  })

  return (
    <View>
      <VictoryPie
        width={screenWidth - 44 * 2}
        height={340}
        x={yAxisField}
        y={xAxisField}
        data={values}
        labelRadius={({ innerRadius }) => innerRadius + 90}
        colorScale={colorScale}
        cornerRadius={2}
        innerRadius={innerRadious}
        theme={VictoryTheme.material}
        // labelComponent={<VictoryLabel angle={45} textAnchor={'end'} dx={15} />}
        labels={({ datum }) => {
          return `${numeral((datum[xAxisField] * 100) / total).format('0')}%`
        }}
        // labelPosition={'centroid'}
        // labelPlacement={'parallel'}
        padding={{ top: 24, bottom: 12 }}
      />
      <VictoryLegend
        x={32}
        y={12}
        width={screenWidth - 44 * 2}
        colorScale={colorScale}
        orientation="vertical"
        symbolSpacer={10}
        data={legendNames}
        padding={{ top: 0, bottom: 0 }}
      />
    </View>
  )
}

const DonutChart = ({ xAxisField, yAxisField, values }: ChartProps) => {
  return (
    <PieChart
      xAxisField={xAxisField}
      yAxisField={yAxisField}
      values={values}
      innerRadious={64}
    />
  )
}

const AreaChart = ({
  xAxisField,
  yAxisField,
  xAxisLabel,
  yAxisLabel,
  values,
}: ChartProps) => {
  const { width: screenWidth } = useWindowDimensions()
  return (
    <VictoryChart
      containerComponent={
        // <VictoryZoomContainer
        //   responsive={false}
        //   height={380}
        //   zoomDimension="x"
        // />
        <VictoryContainer
          height={380}
          width={screenWidth - 44 * 2}
          events={{ onPressIn: () => {} }}
          style={
            {
              // border: '4px solid #00ff00',
              // backgroundColor: 'orange',
              // padding: 0,
              // margin: 0,
              // borderWidth: 1,
              // borderColor: 'red',
            }
          }
        />
      }
      width={screenWidth - 20 * 2}
      theme={VictoryTheme.material}
      style={{
        parent: {
          // alignItems: 'center',
          // border: '4px solid #00ff00',
          // backgroundColor: 'orange',
          // padding: 0,
          // margin: 0,
          // borderWidth: 4,
          // borderColor: 'red',
        },
        // background: {
        //   fill: 'pink',
        // },
      }}
    >
      <VictoryAxis
        label={xAxisLabel}
        style={{
          axisLabel: { fill: Colors.GREEN_DARK, fontSize: 16, padding: 48 },
          ticks: { size: 4 },
          tickLabels: { angle: -60, alignItems: 'baseline' },
        }}
        tickFormat={x => `${x}`.split(' ')}
        tickLabelComponent={
          <VictoryLabel dx={0} dy={-10} angle={-45} textAnchor="end" />
        }
        // tickFormat={x => {
        //   let label = x
        //   for (let name of months) {
        //     const monthRegex = new RegExp(name, 'i')
        //     if (monthRegex.test(x)) {
        //       label = x.replace(monthRegex, name.slice(0, 3).toUpperCase())
        //     }
        //   }
        //   return label.split(' ')
        // }}
      />
      <VictoryAxis
        dependentAxis
        label={yAxisLabel}
        style={{
          axisLabel: { fill: Colors.GREEN_DARK, fontSize: 16, padding: 36 },
          ticks: { size: 4 },
          // tickLabels: { angle: -60, alignItems: 'baseline' },
        }}
        tickFormat={x => numeral(x).format('0a')}
      />
      <VictoryArea
        x={xAxisField}
        y={yAxisField}
        data={values}
        style={{
          data: { fill: '#27DC61', stroke: '#00AA39', strokeWidth: 1 },
          parent: { border: '1px solid #ccc' },
        }}
      />
    </VictoryChart>
  )
}

const LineChart = ({
  xAxisField,
  yAxisField,
  xAxisLabel,
  yAxisLabel,
  values,
}: ChartProps) => {
  const { width: screenWidth } = useWindowDimensions()
  // console.log(
  //   `[LineChart] values: ${JSON.stringify(values.slice(0, 20), null, 2)}`,
  // )
  // console.log('--------------------\n\n')
  return (
    <>
      <VictoryChart
        containerComponent={
          // <VictoryZoomContainer
          //   responsive={false}
          //   height={380}
          //   zoomDimension="x"
          // />
          <VictoryContainer
            height={380}
            width={screenWidth - 44 * 2}
            events={{ onPressIn: () => {} }}
            style={
              {
                // border: '4px solid #00ff00',
                // backgroundColor: 'orange',
                // padding: 0,
                // margin: 0,
                // borderWidth: 1,
                // borderColor: 'red',
              }
            }
          />
        }
        width={screenWidth - 20 * 2}
        theme={VictoryTheme.material}
        style={{
          parent: {
            // alignItems: 'center',
            // border: '4px solid #00ff00',
            // backgroundColor: 'orange',
            // padding: 0,
            // margin: 0,
            // borderWidth: 4,
            // borderColor: 'red',
          },
          // background: {
          //   fill: 'pink',
          // },
        }}
      >
        <VictoryAxis
          label={xAxisLabel}
          style={{
            axisLabel: { fill: Colors.GREEN_DARK, fontSize: 16, padding: 48 },
            ticks: { size: 4 },
            tickLabels: { angle: -60, alignItems: 'baseline' },
          }}
          tickFormat={x => `${x}`.split(' ')}
          tickLabelComponent={
            <VictoryLabel dx={0} dy={-10} angle={-45} textAnchor="end" />
          }
          // tickFormat={x => {
          //   let label = x
          //   for (let name of months) {
          //     const monthRegex = new RegExp(name, 'i')
          //     if (monthRegex.test(x)) {
          //       label = x.replace(monthRegex, name.slice(0, 3).toUpperCase())
          //     }
          //   }
          //   return label.split(' ')
          // }}
        />
        <VictoryAxis
          dependentAxis
          label={yAxisLabel}
          style={{
            axisLabel: { fill: Colors.GREEN_DARK, fontSize: 16, padding: 36 },
            ticks: { size: 4 },
            // tickLabels: { angle: -60, alignItems: 'baseline' },
          }}
          tickFormat={x => numeral(x).format('0a')}
        />
        <VictoryLine
          x={xAxisField}
          y={yAxisField}
          data={values}
          // labels={({ datum }) => {
          //   return datum.x
          // }}
          style={{
            data: { stroke: '#00AA39', strokeWidth: 1, fill: 'transparent' },
          }}
        />
      </VictoryChart>
    </>
  )
}

const BarChart = ({
  xAxisField,
  yAxisField,
  xAxisLabel,
  yAxisLabel,
  horizontal = true,
  values,
}: BarChartProps) => {
  const { width: screenWidth } = useWindowDimensions()
  return (
    <VictoryChart
      containerComponent={
        <VictoryContainer
          height={380}
          width={screenWidth - 48 * 2}
          events={{ onPressIn: () => {} }}
          style={{ paddingLeft: 8 }}
        />
      }
      width={screenWidth - 24 * 2}
      theme={VictoryTheme.material}
      domainPadding={20}
      style={{
        parent: {
          border: '1px solid #00ff00',
          // backgroundColor: 'orange',
          // paddingBottom: 80,
        },
        // background: {
        //   fill: 'pink',
        // },
      }}
    >
      <VictoryAxis
        label={xAxisLabel}
        // axisLabelComponent={<VictoryLabel dy={-260} angle={0} />}
        tickLabelComponent={
          <VictoryLabel dx={8} dy={-8} angle={-60} textAnchor={'end'} />
        }
        style={{
          axisLabel: {
            fontSize: 16,
            padding: 32,
            fill: Colors.GREEN_DARK,
          },
          ticks: { size: 4 },
          tickLabels: { angle: -60, alignItems: 'baseline' },
        }}
        tickFormat={x => `${x}`.split(' ')}
      />
      <VictoryAxis
        dependentAxis
        label={yAxisLabel}
        // axisLabelComponent={<VictoryLabel dy={-2} />}
        padding={{ left: 40 }}
        tickFormat={x => numeral(x).format('0.0a')}
        style={{
          axisLabel: { fill: Colors.GREEN_DARK, fontSize: 16, padding: 36 },
        }}
      />
      <VictoryBar
        x={xAxisField}
        y={yAxisField}
        data={values.slice(0, 10)}
        horizontal={horizontal}
        labels={({ datum }) => numeral(datum[yAxisField]).format('0,0.0a')}
        alignment="middle"
        labelComponent={
          <VictoryLabel dx={10} dy={5} angle={-60} textAnchor={'start'} />
        }
        style={{
          // labels: { fill: '#ffff00' },
          data: { fill: '#27DC61', stroke: '#00AA39', strokeWidth: 1 },
        }}
        cornerRadius={{
          topLeft: 4,
          topRight: 4,
        }}
      />
    </VictoryChart>
  )
}

const ColumnChart = ({
  xAxisField,
  yAxisField,
  xAxisLabel,
  yAxisLabel,
  values,
}: ChartProps) => {
  return (
    <BarChart
      xAxisField={xAxisField}
      yAxisField={yAxisField}
      xAxisLabel={xAxisLabel}
      yAxisLabel={yAxisLabel}
      values={values}
      horizontal={false}
    />
  )
}

const chartMap = {
  AreaChart,
  LineChart,
  BarChart,
  ColumnChart,
  PieChart,
  DonutChart,
}

const ChartContainer = ({
  preferredChart = null,
  // columns,
  columnMetadata,
  visualFormats,
  values,
  title,
}: ChartContainerProps) => {
  const getChartFormat = (chartType: ChartType | null) => {
    return visualFormats.find(item =>
      chartType ? item.type === chartType : item.type.indexOf('Chart') !== -1,
    )
  }

  const chartFormat = getChartFormat(preferredChart)
  const xAxisLabel = chartFormat?.xField
    ? properCase(columnMetadata[chartFormat?.xField].alias)
    : ''

  let yAxisLabel = ''
  if (chartFormat?.yField) {
    const metadata =
      columnMetadata[
        Array.isArray(chartFormat?.yField)
          ? chartFormat?.yField[0]
          : chartFormat?.yField
      ]

    if (metadata) {
      const unit = metadata?.unit ? `(${metadata.unit})` : ''
      yAxisLabel = `${properCase(metadata.alias)} ${unit}`
    }
  }

  let chart = null
  if (!chartFormat) {
    chart = <Text>No matching chart found</Text>
  } else if (
    ['AreaChart', 'LineChart', 'BarChart', 'ColumnChart'].includes(
      chartFormat?.type,
    ) &&
    typeof chartFormat?.yField === 'string'
  ) {
    const Chart = chartMap[chartFormat?.type]
    chart = (
      <Chart
        xAxisField={chartFormat?.xField}
        yAxisField={chartFormat?.yField}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
        values={values.slice(0, 20)}
      />
    )
  } else if (
    ['PieChart', 'DonutChart'].includes(chartFormat?.type) &&
    chartFormat?.angleField &&
    chartFormat?.colorField
  ) {
    const Chart = chartMap[chartFormat?.type]
    chart = (
      <Chart
        xAxisField={chartFormat?.angleField}
        yAxisField={chartFormat?.colorField}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
        values={values}
      />
    )
  }

  return (
    <View flex center style={styles.container}>
      {chart}
    </View>
  )
}

export default React.memo(ChartContainer)

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
})
