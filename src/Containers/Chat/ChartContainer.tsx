import React from 'react'
import { Dimensions, StyleSheet } from 'react-native'
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
import { ColumnMetadata } from '@/Types/ChatHistory'
import { VisualFormat } from '@/Types/ChatMessage'

interface ChartProps {
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
  columns: string[]
  columnMetadata: ColumnMetadata
  visualFormats: VisualFormat[]
  values: Array<Record<string, any>>
}

const PieChart = ({
  xAxisLabel,
  yAxisLabel,
  innerRadious = 0,
  values,
}: PieChartProps) => {
  const { width: screenWidth } = Dimensions.get('window')
  return (
    <VictoryPie
      width={screenWidth - 24 * 4}
      height={350}
      x={xAxisLabel}
      y={yAxisLabel}
      data={values}
      cornerRadius={2}
      innerRadius={innerRadious}
      theme={VictoryTheme.material}
      labelComponent={<VictoryLabel angle={45} textAnchor={'end'} dx={15} />}
      style={{ parent: { alignItems: 'center', paddingLeft: 20 } }}
    />
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
  const { width: screenWidth } = Dimensions.get('window')
  return (
    <VictoryChart
      // animate={{ duration: 100, easing: 'linear' }}
      style={{ parent: { borderWidth: 1 } }}
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
      height={300}
      width={screenWidth - 24 * 2}
      theme={VictoryTheme.material}
      domainPadding={10}
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
        label="Top 10 Vendors by Spend"
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
      {/* <VictoryArea
        x={xAxisLabel}
        y={yAxisLabel}
        data={values}
        style={{
          data: { fill: '#27DC61', stroke: '#00AA39', strokeWidth: 1 },
          parent: { border: '1px solid #ccc' },
        }}
      /> */}
    </VictoryChart>
  )
}

const LineChart = ({ xAxisLabel, yAxisLabel, values }: ChartProps) => {
  // console.log(
  //   `[Line] xAxisLabel: ${xAxisLabel}, yAxisLabel: ${yAxisLabel}, values: ${JSON.stringify(
  //     values,
  //     null,
  //     2,
  //   )}`,
  // )
  const { width: screenWidth } = Dimensions.get('window')
  return (
    <VictoryChart
      // animate={{ duration: 100, easing: 'linear' }}
      style={{ parent: { borderWidth: 1 } }}
      containerComponent={
        <VictoryContainer
          height={350}
          events={
            {
              // onPressIn: evt => console.log('Tapped...'),
            }
          }
        />
      }
      height={300}
      width={screenWidth - 24 * 2}
      theme={VictoryTheme.material}
      domainPadding={10}
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
        label="Top 10 Vendors by Spend"
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
      <VictoryLine
        x={xAxisLabel}
        y={yAxisLabel}
        data={values}
        style={{
          data: { stroke: '#00AA39', strokeWidth: 1 },
          parent: { border: '1px solid #ccc' },
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
  const { width: screenWidth } = Dimensions.get('window')
  return (
    <VictoryChart
      animate={{ duration: 100, easing: 'linear' }}
      style={{ parent: { borderWidth: 1 } }}
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
      height={300}
      width={screenWidth - 24 * 2}
      theme={VictoryTheme.material}
      domainPadding={10}
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
        label="Top 10 Vendors by Spend"
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
      <VictoryBar
        x={xAxisLabel}
        y={yAxisLabel}
        data={values}
        horizontal={horizontal}
        labels={({ datum }) => numeral(datum[yAxisLabel]).format('0,0.00')}
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

export default function ChartContainer({
  columns,
  columnMetadata,
  visualFormats,
  values,
}: ChartContainerProps) {
  const getChartFormat = () => {
    return visualFormats.find(item => item.type.indexOf('Chart') !== -1)
  }

  let chart = null
  const chartFormat = getChartFormat()
  // console.log(`[ChartContainer] type: ${chartFormat?.type}`)
  if (
    chartFormat?.type === 'AreaChart' &&
    typeof chartFormat?.yField === 'string'
  ) {
    chart = (
      <AreaChart
        xAxisLabel={chartFormat?.xField}
        yAxisLabel={chartFormat?.yField}
        values={values}
      />
    )
  } else if (
    chartFormat?.type === 'LineChart' &&
    typeof chartFormat?.yField === 'string'
  ) {
    chart = (
      <LineChart
        xAxisLabel={chartFormat?.xField}
        yAxisLabel={chartFormat?.yField}
        values={values}
      />
    )
  } else if (
    chartFormat?.type === 'BarChart' &&
    typeof chartFormat?.yField === 'string'
  ) {
    chart = (
      <BarChart
        xAxisLabel={chartFormat?.xField}
        yAxisLabel={chartFormat?.yField}
        horizontal={true}
        values={values}
      />
    )
  } else if (
    chartFormat?.type === 'ColumnChart' &&
    typeof chartFormat?.yField === 'string'
  ) {
    chart = (
      <ColumnChart
        xAxisLabel={chartFormat?.xField}
        yAxisLabel={chartFormat?.yField}
        values={values}
      />
    )
  } else if (
    chartFormat?.type === 'PieChart' &&
    chartFormat?.angleField &&
    chartFormat?.colorField
  ) {
    chart = (
      <PieChart
        xAxisLabel={chartFormat?.angleField}
        yAxisLabel={chartFormat?.colorField}
        innerRadious={0}
        values={values}
      />
    )
  } else if (
    chartFormat?.type === 'DonutChart' &&
    chartFormat?.angleField &&
    chartFormat?.colorField
  ) {
    chart = (
      <DonutChart
        xAxisLabel={chartFormat?.angleField}
        yAxisLabel={chartFormat?.colorField}
        values={values}
      />
    )
  } else {
    chart = (
      <View>
        <Text>No matching chart found</Text>
      </View>
    )
  }

  return (
    <View flex style={styles.container}>
      {chart}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
})
