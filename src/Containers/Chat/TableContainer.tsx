import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native'
import { View } from 'react-native-ui-lib'
import { Table, Row } from 'react-native-table-component'
import _ from 'lodash'
import DownArrow from '@/Assets/Images/drawer/down-arrow.svg'
import UpArrow from '@/Assets/Images/drawer/up-arrow.svg'
import { ColumnMetadata } from '@/Types/ChatHistory'
import { properCase, getFormattedRowData } from '@/Utils/common'
import { useTheme } from '@/Hooks'

interface TableProps {
  id: string
  columns: string[]
  columnMetadata: ColumnMetadata
  values: Array<Record<string, any>>
}

interface ItemProps {
  item: Record<string, any>
  index: number
}

const textdataFormatter = (value: string, isNumeric: boolean) => (
  <Text numberOfLines={1} style={[styles.cell, isNumeric && styles.number]}>
    {value}
  </Text>
)
const { width: screenWidth } = Dimensions.get('screen')

/**
 * Calculate column width and increase the those columns of type 'desc|remark|comment|note|detail'
 *
 * @param columns column names
 * @returns calculated column width
 */
const calculateColumnWidth = (columns: string[]): number[] => {
  let defaultWidth: number = 120
  if (columns.length === 1) {
    defaultWidth = screenWidth * 0.96
  } else if (columns.length === 2) {
    defaultWidth = screenWidth / 2.1
  }
  return columns.map(name =>
    name.match(/desc|remark|comment|note|detail/gi)?.length
      ? 400
      : defaultWidth,
  )
}

function TableContainer({ id, columns, columnMetadata, values }: TableProps) {
  const ROW_HEIGHT = 40
  let widthArr = calculateColumnWidth(columns)
  const { Layout, Colors, Common, Fonts } = useTheme()
  const [direction, setDirection] = useState<string | null>(null)
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null)
  const [rows, setRows] = useState(values)

  useEffect(() => {
    setRows(values)
  }, [values])

  const sortTable = (column: string) => {
    const sortDirection = direction === 'desc' ? 'asc' : 'desc'
    const sortedData = _.orderBy(rows, [column], [sortDirection])
    setSelectedColumn(column)
    setDirection(sortDirection)
    setRows(sortedData)
  }

  const headerList = columns.map(column => {
    const columnLabel =
      columnMetadata && columnMetadata[column]
        ? columnMetadata[column].alias
        : column
    return (
      <TouchableOpacity
        style={styles.headerLabel}
        onPress={() => sortTable(column)}
      >
        <Text style={styles.headerText}>
          {properCase(columnLabel) + ' '}
          {selectedColumn === column &&
            (direction === 'desc' ? <DownArrow /> : <UpArrow />)}
        </Text>
      </TouchableOpacity>
    )
  })

  const renderItem = ({ item: row, index }: ItemProps) => (
    <Row
      key={`${index}`}
      data={getFormattedRowData(
        columns,
        columnMetadata,
        row,
        textdataFormatter,
      )}
      widthArr={widthArr}
      style={[
        styles.row,
        index % 2 === 1 && styles.rowOdd,
        { height: ROW_HEIGHT },
      ]}
    />
  )

  const rowLength = rows.length
  const getItemLayout = (data: any, index: number) => ({
    length: ROW_HEIGHT,
    offset: ROW_HEIGHT * index,
    index,
  })

  return (
    <FlatList
      style={styles.tableWrapper}
      contentContainerStyle={{ paddingBottom: rowLength >= 15 ? 150 : 0 }}
      data={rows}
      stickyHeaderIndices={[0]}
      initialNumToRender={25}
      maxToRenderPerBatch={250}
      updateCellsBatchingPeriod={20}
      removeClippedSubviews={true}
      // legacyImplementation={true}
      ListHeaderComponent={
        <Table>
          <Row data={headerList} widthArr={widthArr} style={styles.header} />
        </Table>
      }
      showsVerticalScrollIndicator={false}
      getItemLayout={getItemLayout}
      renderItem={renderItem}
      listKey={id}
    />
  )
}

export default React.memo(TableContainer)

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    // alignItems: 'center',
    // borderWidth: 2,
    // borderColor: '#EAFAEA',
  },
  tableWrapper: {
    flexGrow: 0,
    borderRadius: 8,
  },
  header: {
    height: 42,
    backgroundColor: '#27DC61',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    // fontFamily: 'Montserrat-Regular',
    fontWeight: '900',
  },
  headerLabel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    // fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    color: '#4d4d4d',
  },
  cell: {
    marginHorizontal: 6,
    color: '#595959',
  },
  number: { textAlign: 'right' },
  row: {
    height: 40,
    backgroundColor: '#FFFFFF' /* '#E7E6E1' */,
  },
  rowOdd: {
    backgroundColor: '#f0fcf4' /* '#F0FBFC' '#F7F6E7' */,
  },
})
