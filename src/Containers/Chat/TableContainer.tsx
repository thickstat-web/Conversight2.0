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
  <Text style={[styles.cell, isNumeric && styles.number]}>{value}</Text>
)
const { width: screenWidth } = Dimensions.get('screen')

function TableContainer({ id, columns, columnMetadata, values }: TableProps) {
  const columnWidth = columns.length <= 2 ? 160 : 120
  const calculateValueLength = values.length * 0.28
  const ROW_HEIGHT = 40 + calculateValueLength
  let widthArr = new Array(columns.length).fill(columnWidth)
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
    // console.log("columnLabel values are "+columnLabel)
    // console.log("columnLabel column values are "+columnMetadata[column])
    // console.log("column label column values are "+JSON.stringify(columnMetadata[column]))
    // console.log("column alias values are "+columnMetadata[column].alias)
    // console.log("column meta data is "+JSON.stringify(columnMetadata));
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
  const headerListLength = headerList.length
  return (
    <View style={styles.container}>
      <View style={{ paddingBottom: rowLength >= 15 ? 90 : 0 }}>
        <FlatList
          data={rows}
          stickyHeaderIndices={[0]}
          initialNumToRender={20}
          removeClippedSubviews={true}
          maxToRenderPerBatch={100}
          updateCellsBatchingPeriod={50}
          legacyImplementation={true}
          style={styles.tableWrapper}
          ListHeaderComponent={
            <Table>
              <Row
                data={headerList}
                {...((headerListLength == 2 &&
                  (widthArr = [screenWidth / 2.1, screenWidth / 2.1])) ||
                  (headerListLength == 1 && (widthArr = [screenWidth * 0.96])))}
                style={styles.header}
              />
            </Table>
          }
          showsVerticalScrollIndicator={false}
          getItemLayout={getItemLayout}
          renderItem={renderItem}
          listKey={id}
        />
      </View>
    </View>
  )
}

export default React.memo(TableContainer)

const styles = StyleSheet.create({
  container: {
    // flex: 1,
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
