import { ChartType, VisualFormat } from '@/Types/ChatMessage'
import { Platform, StyleSheet, useWindowDimensions } from 'react-native'
import React, { useState } from 'react'
import { Text, View } from 'react-native-ui-lib'
import { Button } from '@/Components'
import { RESET_PREVIEWER } from '@/Config'
import {
  VictoryArea,
  VictoryAxis,
  VictoryBar,
  VictoryBrushContainer,
  VictoryChart,
  VictoryLabel,
  VictoryLegend,
  VictoryLine,
  VictoryPie,
  VictoryScatter,
  VictoryTheme,
  VictoryZoomContainer,
} from 'victory-native'
import { dataFormatter, properCase } from '@/Utils/common'

import { Colors } from '@/Theme/Variables'
import { ColumnMetadata } from '@/Types/ChatHistory'
import { ScrollView } from 'react-native-gesture-handler'
import numeral from 'numeral'
import { useTheme } from '@/Hooks'

interface ChartProps {
  xAxisLabel: string
  yAxisLabel: string
  xAxisField: string
  yAxisField: string
  columnMetadata: ColumnMetadata
  values: Array<Record<string, any>>
  enableChartPreview: boolean
  enableResetButton: boolean
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
  enableChartPreview: boolean
  enableResetButton: boolean
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

const isIOS = Platform.OS === 'ios'
const defaultXvalues = 18
const getxAxisLabelHeight = (
  values: Array<Record<string, any>>,
  xAxisField: string,
): number => {
  let maxXLabelLength = 0
  values.forEach(item => {
    const fieldLen = `${item[xAxisField]}`.length
    maxXLabelLength = Math.max(isNaN(fieldLen) ? 1 : fieldLen, maxXLabelLength)
  })
  return maxXLabelLength * (isIOS ? 5.8 : 7)
}

const getFormattedValues = (
  values: Array<Record<string, any>>,
  xAxisField: string,
): Array<Record<string, any>> => {
  return values.map(item => ({
    ...item,
    [xAxisField]: `${item[xAxisField]}`,
  }))
}

const PieChart = ({
  xAxisField,
  yAxisField,
  innerRadious = 0,
  values,
}: PieChartProps) => {
  const { Colors, Fonts } = useTheme()
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  let total = 0.0
  let legendNames: LegendName[] = []
  values.forEach(item => {
    total += item[xAxisField]
  })
  values.forEach(item => {
    const name = {
      name: `${item[yAxisField]} (${numeral(item[xAxisField]).format(
        '0,0.00',
      )})`,
    }
    legendNames.push(name)
  })

  return (
    <ScrollView>
      <VictoryPie
        // width={screenWidth * 0.7}
        height={screenHeight / 3}
        x={yAxisField}
        y={xAxisField}
        data={values}
        labelRadius={90}
        colorScale={colorScale}
        cornerRadius={2}
        innerRadius={innerRadious}
        theme={VictoryTheme.material}
        labels={({ datum }) => {
          let value = numeral((datum[xAxisField] * 100) / total).format('0')
          let numValue = parseInt(value)
          if (numValue <= 4) {
            return ''
          }
          value = numValue.toString()
          return `${value}%`
        }}
        padding={{ top: 0, right: 0, bottom: 10, left: 0 }}
      />
      <VictoryLegend
        x={32}
        // y={12}
        width={screenWidth}
        height={values.length * (isIOS ? 28 : 28)}
        colorScale={colorScale}
        orientation="vertical"
        symbolSpacer={10}
        // rowGutter={{ top: 0, bottom: 10 }}
        data={legendNames}
        // padding={{ top: 20, bottom: 0 }}
      />
    </ScrollView>
  )
}

const DonutChart = ({ xAxisField, yAxisField, values }: ChartProps) => {
  return (
    <PieChart
      xAxisField={xAxisField}
      yAxisField={yAxisField}
      values={values}
      innerRadious={60}
    />
  )
}

const AreaChart = ({
  xAxisField,
  yAxisField,
  xAxisLabel,
  yAxisLabel,
  columnMetadata,
  values,
  enableChartPreview,
  enableResetButton,
}: ChartProps) => {
  const { width: screenWidth } = useWindowDimensions()
  const [selectedDomain, setSelectedDomain] = useState<{
    x: [any, any]
    y: [any, any]
  }>()
  const [zoomDomain, setZoomDomain] = useState<{
    x: [any, any]
    y: [any, any]
  }>()
  const xValues = values.map(item => item[xAxisLabel])

  const formattedValues = getFormattedValues(values, xAxisField)
  const dynamicHeight = getxAxisLabelHeight(values, xAxisField)
  const staticHeight = 170
  const heightAdjust =
    dynamicHeight >= staticHeight ? staticHeight : dynamicHeight
  const calculateXvalues = values.length
  const calXval =
    calculateXvalues >= defaultXvalues ? defaultXvalues : calculateXvalues
  const XDOMAIN: { x: number[] } = { x: [0.5, calXval] }

  const resetHandle = () => {
    setZoomDomain(selectedDomain)
  }

  return (
    <>
      <VictoryChart
        domain={XDOMAIN}
        domainPadding={{ y: 40 }}
        height={340 + heightAdjust}
        containerComponent={
          <VictoryZoomContainer
            // width={screenWidth * 0.95}
            responsive={true}
            zoomDimension="x"
            allowPan={true}
            allowZoom={true}
            zoomDomain={zoomDomain}
            onZoomDomainChange={setSelectedDomain}
          />
        }
        padding={{ left: 58, top: 4, bottom: 40 + heightAdjust, right: 12 }}
      >
        <VictoryAxis // X Axis Container
          axisLabelComponent={<VictoryLabel dy={heightAdjust} />}
          label={xAxisLabel}
          tickLabelComponent={<VictoryLabel dx={8} dy={-8} textAnchor="end" />}
          style={{
            axisLabel: {
              fill: Colors.GREEN_DARK,
              fontWeight: 'bold',
            },
            ticks: { stroke: 'grey', size: 4 },
            tickLabels: { angle: -90, alignItems: 'baseline' },
          }}
          tickFormat={x => dataFormatter(x, columnMetadata[xAxisField])}
        />
        <VictoryAxis // Y Axis Conatiner
          dependentAxis
          axisLabelComponent={<VictoryLabel dy={-16} />}
          label={yAxisLabel}
          tickFormat={x => numeral(x).format('0a')}
          tickLabelComponent={<VictoryLabel dx={8} textAnchor={'end'} />}
          style={{
            axisLabel: {
              fill: Colors.GREEN_DARK,
              fontWeight: 'bold',
            },
            ticks: { stroke: 'grey', size: 4 },
          }}
        />
        <VictoryArea
          x={xAxisField}
          y={yAxisField}
          data={formattedValues}
          interpolation="natural"
          labels={({ datum }) => numeral(datum[yAxisField]).format('0a')}
          labelComponent={
            <VictoryLabel dx={8} dy={2} angle={-90} textAnchor={'start'} />
          }
          style={{
            data: {
              fill: Colors.NOTIFICATION_GREEN,
              stroke: '#00AA39',
              strokeWidth: 1,
            },
            parent: { border: '1px solid #ccc' },
          }}
        />
        <VictoryScatter
          x={xAxisField}
          y={yAxisField}
          data={formattedValues}
          style={{ data: { fill: Colors.GREEN_MAIN } }}
          size={4}
        />
      </VictoryChart>
      {enableChartPreview && (
        <ChartPreviewer
          domain={{ x: [0, 12] }}
          screenWidth={screenWidth}
          selectedDomain={selectedDomain}
          setZoomDomain={setZoomDomain}
          xValues={xValues}
          xAxisLabel={xAxisLabel}
          xAxisField={xAxisField}
          yAxisField={yAxisField}
          values={formattedValues}
        />
      )}
      {enableResetButton && (
        <Button label={RESET_PREVIEWER} onPress={resetHandle} />
      )}
    </>
  )
}

const LineChart = ({
  xAxisField,
  yAxisField,
  xAxisLabel,
  yAxisLabel,
  columnMetadata,
  values,
  enableChartPreview,
  enableResetButton,
}: ChartProps) => {
  const { width: screenWidth } = useWindowDimensions()
  const [selectedDomain, setSelectedDomain] = useState<{ x: any; y: any }>()
  const [zoomDomain, setZoomDomain] = useState<{ x: any; y: any }>()
  const xValues = values.map(item => item[xAxisLabel])
  const formattedValues = getFormattedValues(values, xAxisField)
  const dynamicHeight = getxAxisLabelHeight(values, xAxisField)
  const staticHeight = 170
  const heightAdjust =
    dynamicHeight >= staticHeight ? staticHeight : dynamicHeight

  const calculateXvalues = values.length
  const calXval =
    calculateXvalues >= defaultXvalues ? defaultXvalues : calculateXvalues
  const XDOMAIN: { x: number[] } = { x: [0.5, calXval] }

  const resetHandle = () => {
    setZoomDomain(selectedDomain)
  }

  return (
    <>
      <VictoryChart
        domainPadding={{ y: 40 }}
        height={340 + heightAdjust}
        domain={XDOMAIN}
        containerComponent={
          <VictoryZoomContainer
            responsive={true}
            zoomDimension="x"
            allowPan={true}
            allowZoom={true}
            zoomDomain={zoomDomain}
            // width={screenWidth * 0.95}
            onZoomDomainChange={setSelectedDomain}
          />
        }
        padding={{ left: 58, top: 4, bottom: 40 + heightAdjust, right: 12 }}
      >
        <VictoryAxis // X Axis Container
          axisLabelComponent={<VictoryLabel dy={heightAdjust} />}
          label={xAxisLabel}
          tickLabelComponent={<VictoryLabel dx={8} dy={-8} textAnchor="end" />}
          style={{
            axisLabel: {
              fill: Colors.GREEN_DARK,
              fontWeight: 'bold',
            },
            ticks: { stroke: 'grey', size: 4 },
            tickLabels: { angle: -90, alignItems: 'baseline' },
          }}
          tickFormat={x => dataFormatter(x, columnMetadata[xAxisField])}
        />
        <VictoryAxis // Y Axis Conatiner
          dependentAxis
          axisLabelComponent={<VictoryLabel dy={-16} />}
          label={yAxisLabel}
          tickFormat={x => numeral(x).format('0a')}
          tickLabelComponent={<VictoryLabel dx={8} textAnchor={'end'} />}
          style={{
            axisLabel: {
              fill: Colors.GREEN_DARK,
              fontWeight: 'bold',
            },
            ticks: { stroke: 'grey', size: 4 },
          }}
        />
        <VictoryLine
          x={xAxisField}
          y={yAxisField}
          data={formattedValues}
          interpolation="natural"
          labels={({ datum }) => numeral(datum[yAxisField]).format('0a')}
          labelComponent={
            <VictoryLabel dx={8} dy={2} angle={-90} textAnchor={'start'} />
          }
          style={{
            data: { stroke: '#00AA39', strokeWidth: 1, fill: 'transparent' },
          }}
        />
        <VictoryScatter
          x={xAxisField}
          y={yAxisField}
          data={formattedValues}
          style={{ data: { fill: Colors.GREEN_MAIN } }}
          size={4}
        />
      </VictoryChart>
      {enableChartPreview && (
        <ChartPreviewer
          screenWidth={screenWidth}
          selectedDomain={selectedDomain}
          setZoomDomain={setZoomDomain}
          xValues={xValues}
          xAxisLabel={xAxisLabel}
          xAxisField={xAxisField}
          yAxisField={yAxisField}
          values={formattedValues}
        />
      )}
      {enableResetButton && (
        <Button label={RESET_PREVIEWER} onPress={resetHandle} />
      )}
    </>
  )
}

const BarChart = ({
  xAxisField,
  yAxisField,
  xAxisLabel,
  yAxisLabel,
  columnMetadata,
  values,
  horizontal = false,
  enableChartPreview,
  enableResetButton,
}: BarChartProps) => {
  const [selectedDomain, setSelectedDomain] = useState<{ x: any; y: any }>()
  const [zoomDomain, setZoomDomain] = useState<{ x: any; y: any }>()
  const { width: screenWidth } = useWindowDimensions()
  const xValues = values.map(item => item[xAxisLabel])

  const formattedValues = getFormattedValues(values, xAxisField)
  const dynamicHeight = getxAxisLabelHeight(values, xAxisField)
  const staticHeight = 170
  const heightAdjust =
    dynamicHeight >= staticHeight ? staticHeight : dynamicHeight
  const calculateXvalues = values.length
  const calXval =
    calculateXvalues >= defaultXvalues ? defaultXvalues : calculateXvalues
  const XDOMAIN: { x: number[] } = { x: [0.5, calXval] }

  const resetHandle = () => {
    setZoomDomain(selectedDomain)
  }

  return (
    <>
      <VictoryChart
        domain={XDOMAIN}
        domainPadding={{ y: 40 }}
        height={340 + heightAdjust}
        // width={screenWidth}
        containerComponent={
          <VictoryZoomContainer
            responsive={true}
            zoomDimension="x"
            allowZoom={true}
            allowPan={true}
            zoomDomain={zoomDomain}
            onZoomDomainChange={setSelectedDomain}
          />
        }
        padding={{ left: 58, top: 4, bottom: 40 + heightAdjust, right: 12 }}
        // style={{ parent: { backgroundColor: 'yellow' } }}
      >
        <VictoryAxis // X Axis Container
          axisLabelComponent={<VictoryLabel dy={heightAdjust} />}
          label={xAxisLabel}
          tickLabelComponent={<VictoryLabel dx={8} dy={-8} textAnchor="end" />}
          style={{
            axisLabel: {
              fill: Colors.GREEN_DARK,
              fontWeight: 'bold',
            },
            ticks: { stroke: 'grey', size: 4 },
            tickLabels: { angle: -90, alignItems: 'baseline' },
          }}
          tickFormat={x => dataFormatter(x, columnMetadata[xAxisField])}
        />
        <VictoryAxis // Y Axis Conatiner
          dependentAxis
          axisLabelComponent={<VictoryLabel dy={-16} />}
          label={yAxisLabel}
          tickFormat={x => numeral(x).format('0a')}
          tickLabelComponent={<VictoryLabel dx={8} textAnchor={'end'} />}
          style={{
            axisLabel: {
              fill: Colors.GREEN_DARK,
              fontWeight: 'bold',
            },
            ticks: { stroke: 'grey', size: 4 },
          }}
        />
        <VictoryBar
          x={xAxisField}
          y={yAxisField}
          data={formattedValues}
          barRatio={0.1}
          domain={{ x: [0, 1] }}
          horizontal={horizontal}
          labels={({ datum }) => numeral(datum[yAxisField]).format('0a')}
          labelComponent={
            <VictoryLabel dx={2} dy={6} angle={-90} textAnchor={'start'} />
          }
          style={{
            data: {
              fill: '#27DC61',
              stroke: 'black',
              strokeWidth: 1,
              width: 10,
            },
          }}
          cornerRadius={{
            topLeft: 4,
            topRight: 4,
          }}
        />
      </VictoryChart>
      {enableChartPreview && (
        <ChartPreviewer
          screenWidth={screenWidth}
          selectedDomain={selectedDomain}
          setZoomDomain={setZoomDomain}
          xValues={xValues}
          xAxisLabel={xAxisLabel}
          xAxisField={xAxisField}
          yAxisField={yAxisField}
          values={formattedValues}
        />
      )}
      {enableResetButton && (
        <Button label={RESET_PREVIEWER} onPress={resetHandle} />
      )}
    </>
  )
}

const HorizontalBarChart = (props: ChartProps) => {
  return <BarChart {...props} horizontal={true} />
}

const chartMap = {
  AreaChart,
  LineChart,
  BarChart,
  HorizontalBarChart,
  PieChart,
  DonutChart,
}

const ChartContainer = ({
  preferredChart = null,
  columnMetadata,
  visualFormats,
  values,
  enableChartPreview,
  enableResetButton,
}: ChartContainerProps) => {
  const getChartFormat = (chartType: ChartType | null) => {
    return visualFormats.find(item =>
      chartType ? item.type === chartType : item.type.indexOf('Chart') !== -1,
    )
  }

  const chartFormat = getChartFormat(preferredChart)
  let xAxisLabel = chartFormat?.xField
  if (xAxisLabel && columnMetadata[xAxisLabel]) {
    const metadata = columnMetadata[xAxisLabel]
    xAxisLabel = properCase(metadata.alias)
  }

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
    ['AreaChart', 'LineChart', 'BarChart', 'HorizontalBarChart'].includes(
      chartFormat?.type,
    ) &&
    typeof chartFormat?.yField === 'string'
  ) {
    const Chart = chartMap[chartFormat?.type as Partial<ChartType>]
    chart = (
      <Chart
        xAxisField={chartFormat?.xField}
        yAxisField={chartFormat?.yField}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
        columnMetadata={columnMetadata}
        values={values}
        enableChartPreview={enableChartPreview}
        enableResetButton={enableResetButton}
        horizontal={false}
      />
    )
  } else if (
    ['PieChart', 'DonutChart'].includes(chartFormat?.type) &&
    chartFormat?.angleField &&
    chartFormat?.colorField
  ) {
    const Chart = chartMap[chartFormat?.type as Partial<ChartType>]
    chart = (
      <Chart
        xAxisField={chartFormat?.angleField}
        yAxisField={chartFormat?.colorField}
        xAxisLabel={xAxisLabel}
        columnMetadata={columnMetadata}
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

function ChartPreviewer({
  selectedDomain,
  setZoomDomain,
  yAxisField,
  values,
}: any) {
  const { width: screenWidth } = useWindowDimensions()
  return (
    <View marginT-12>
      <VictoryChart
        domainPadding={{ y: 6 }}
        width={screenWidth}
        height={60}
        scale={{
          x: 'linear',
          y: 'linear',
        }}
        padding={{
          top: 0,
          left: 30,
          right: 30,
          bottom: 10,
        }}
        containerComponent={
          <VictoryBrushContainer
            responsive={true}
            allowDraw={true}
            defaultBrushArea={'move'}
            brushDimension="x"
            brushDomain={selectedDomain}
            onBrushDomainChange={setZoomDomain}
            brushStyle={{
              stroke: 'transparent',
              fill: '#014E40',
              fillOpacity: 0.1,
            }}
          />
        }
      >
        <VictoryAxis tickFormat={_ => ``} />
        <VictoryLine
          interpolation="natural"
          style={{
            data: {
              stroke: Colors.GREEN_LIGHT,
            },
          }}
          y={yAxisField}
          data={values}
        />
      </VictoryChart>
      <Text
        style={{
          marginLeft: 26,
          paddingBottom: 10,
          color: Colors.GREEN_DARK,
          textAlign: 'center',
          letterSpacing: 1,
        }}
      >
        (Drag to highlight a region of chart)
      </Text>
    </View>
  )
}

export default React.memo(ChartContainer)

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    paddingTop: 16,
  },
})
