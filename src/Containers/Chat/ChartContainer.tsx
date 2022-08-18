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
  VictoryContainer,
} from 'victory-native'
import numeral from 'numeral'
import { useTheme } from '@/Hooks'
import { Colors } from '@/Theme/Variables'
import { ColumnMetadata } from '@/Types/ChatHistory'
import { ChartType, VisualFormat } from '@/Types/ChatMessage'

interface ChartProps {
  title: string
  xAxisLabel: string
  yAxisLabel: string
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
  xAxisLabel,
  yAxisLabel,
  innerRadious = 0,
  values,
}: PieChartProps) => {
  const { Colors, Fonts } = useTheme()
  const { width: screenWidth } = useWindowDimensions()
  return (
    <View>
      {/* <View padding-6 marginB-8>
        <Text
          numberOfLines={1}
          style={[
            {
              color: Colors.GREEN_MAIN,
              textAlign: 'center',
              fontWeight: 'bold',
            },
          ]}
        >
          {title}
        </Text>
      </View> */}
      <VictoryPie
        width={screenWidth - 24 * 2}
        // height={350}
        x={xAxisLabel}
        y={yAxisLabel}
        data={values}
        colorScale={colorScale}
        cornerRadius={2}
        innerRadius={innerRadious}
        theme={VictoryTheme.material}
        // labelComponent={<VictoryLabel angle={45} textAnchor={'end'} dx={15} />}
        labels={({ datum }) => {
          return `${datum.yName}`
          // return numeral(datum[xAxisLabel]).format('0a')
          // return `${datum.yName} (${numeral(datum[xAxisLabel]).format('0a')})`
        }}
        labelPosition={'centroid'}
        labelPlacement={'parallel'}
      />
    </View>
  )
}

const DonutChart = ({ xAxisLabel, yAxisLabel, values }: ChartProps) => {
  return (
    <PieChart
      xAxisLabel={xAxisLabel}
      yAxisLabel={yAxisLabel}
      values={values}
      innerRadious={64}
    />
  )
}

const AreaChart = ({ xAxisLabel, yAxisLabel, values }: ChartProps) => {
  const { width: screenWidth } = useWindowDimensions()
  return (
    <VictoryChart
      // animate={{ duration: 100, easing: 'linear' }}
      // style={{ parent: { borderWidth: 1 } }}
      containerComponent={
        <VictoryContainer
          height={400}
          events={
            {
              // onPressIn: evt => console.log('Tapped...'),
            }
          }
        />
      }
      // height={300}
      // width={screenWidth - 24 * 2}
      theme={VictoryTheme.material}
      domainPadding={10}
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
        // label="Top 10 Vendors by Spend"
        axisLabelComponent={<VictoryLabel dy={-260} angle={0} />}
        tickLabelComponent={
          <VictoryLabel dx={2} dy={-8} angle={-60} textAnchor={'end'} />
        }
        style={{
          axisLabel: {
            fontSize: 16,
            fontWeight: 'bold',
            padding: 8,
            fill: '#00AA39',
          },
          ticks: { size: 4 },
          tickLabels: { angle: -60, alignItems: 'baseline' },
        }}
      />
      <VictoryAxis dependentAxis tickFormat={x => numeral(x).format('$0a')} />
      <VictoryArea
        x={xAxisLabel}
        y={yAxisLabel}
        data={values}
        style={{
          data: { fill: '#27DC61', stroke: '#00AA39', strokeWidth: 1 },
          parent: { border: '1px solid #ccc' },
        }}
      />
    </VictoryChart>
  )
}

const LineChart = ({ xAxisLabel, yAxisLabel, values }: ChartProps) => {
  const { width: screenWidth } = useWindowDimensions()
  return (
    <VictoryChart
      // animate={{ duration: 100, easing: 'linear' }}
      // style={{ parent: { borderWidth: 1 } }}
      containerComponent={
        <VictoryContainer
          // height={350}
          events={{
            onPressIn: () => {
              // console.log(`[LineChart] touched here...`)
            },
          }}
        />
      }
      // height={300}
      // width={screenWidth - 24 * 2}
      theme={VictoryTheme.material}
      domainPadding={10}
      // style={{
      //   parent: {
      //     // alignItems: 'center',
      //     border: '1px solid #00ff00',
      //     // backgroundColor: 'orange',
      //     // paddingBottom: 80,
      //   },
      //   // background: {
      //   //   fill: 'pink',
      //   // },
      // }}
    >
      <VictoryAxis
        // label="Line Chart"
        style={{
          axisLabel: { fill: '#00AA39' },
          ticks: { size: 4 },
          tickLabels: { angle: -60, alignItems: 'baseline' },
        }}
        tickFormat={x => `${x}`}
      />
      <VictoryAxis dependentAxis tickFormat={x => numeral(x).format('$0a')} />
      <VictoryArea
        x={xAxisLabel}
        y={yAxisLabel}
        data={values}
        style={{
          data: { stroke: '#00AA39', strokeWidth: 1, fill: 'transparent' },
          // parent: { border: '1px solid #ccc' },
        }}
      />
    </VictoryChart>
  )
}

const BarChart = ({
  xAxisLabel,
  yAxisLabel,
  horizontal = true,
  values,
}: BarChartProps) => {
  const { width: screenWidth } = useWindowDimensions()
  return (
    <VictoryChart
      // animate={{ duration: 100, easing: 'linear' }}
      style={{ parent: { borderWidth: 1 } }}
      // containerComponent={<VictoryContainer height={325} />}
      height={300}
      // width={screenWidth - 24 * 2}
      theme={VictoryTheme.material}
      domainPadding={20}
      style={{
        parent: {
          // alignItems: 'center',
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
        axisLabelComponent={<VictoryLabel dy={-260} angle={0} />}
        // tickLabelComponent={
        //   <VictoryLabel dx={2} dy={-8} angle={-60} textAnchor={'end'} />
        // }
        style={{
          axisLabel: {
            fontSize: 16,
            fontWeight: 'bold',
            padding: 8,
            fill: '#00AA39',
          },
          ticks: { size: 4 },
          tickLabels: { angle: -60, alignItems: 'baseline' },
        }}
      />
      {/* tickFormat={x => numeral(x).format('$0a')} */}
      {/* <VictoryAxis dependentAxis tickFormat={x => numeral(x).format('0a')} /> */}
      <VictoryAxis dependentAxis tickFormat={x => x} />
      <VictoryBar
        x={xAxisLabel}
        y={yAxisLabel}
        data={values.slice(0, 10)}
        horizontal={horizontal}
        labels={({ datum }) => numeral(datum[yAxisLabel]).format('0,0a')}
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

const ColumnChart = ({ xAxisLabel, yAxisLabel, values }: ChartProps) => {
  return (
    <BarChart
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
  // columnMetadata,
  visualFormats,
  values,
  title,
}: ChartContainerProps) => {
  const getChartFormat = (chartType: ChartType | null) => {
    return visualFormats.find(item =>
      chartType ? item.type === chartType : item.type.indexOf('Chart') !== -1,
    )
  }

  let chart = null
  const chartFormat = getChartFormat(preferredChart)
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
        title={title}
        xAxisLabel={chartFormat?.xField}
        yAxisLabel={chartFormat?.yField}
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
        title={title}
        xAxisLabel={chartFormat?.angleField}
        yAxisLabel={chartFormat?.colorField}
        values={values}
      />
    )
  }

  return (
    <View flex style={styles.container}>
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
