import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { Table, Row } from 'react-native-table-component'
import _ from 'lodash'
import DownArrow from '@/Assets/Images/drawer/down-arrow.svg'
import UpArrow from '@/Assets/Images/drawer/up-arrow.svg'
import { ColumnMetadata } from '@/Types/ChatHistory'
import { properCase, formatValue } from '@/Utils/common'

const getStyledRowData = (
  columns: string[],
  columnMetadata: ColumnMetadata,
  row: Record<string, any>,
) => {
  return Object.values(row).map((value: any, index: number) => {
    const column = columns[index]
    let metadata = columnMetadata[column]
    let isNumeric = metadata ? metadata.isNumericFormat : false
    let displayValue = value
    if (isNumeric) {
      const { prefix, value: text, suffix } = formatValue(value, metadata)
      displayValue = `${prefix} ${text} ${suffix}`.trim()
    }
    return (
      <Text numberOfLines={1} style={[styles.cell, isNumeric && styles.number]}>
        {displayValue}
      </Text>
    )
  })
}

interface TableProps {
  columns: string[]
  columnMetadata: ColumnMetadata
  values: Array<Record<string, any>>
}

function TableContainer({ columns, columnMetadata, values }: TableProps) {
  const columnWidth = columns.length <= 2 ? 180 : 120
  const widthArr = new Array(columns.length).fill(columnWidth)
  const [direction, setDirection] = useState<string | null>(null)
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null)
  const [rows, setRows] = useState(values)

  // if (values.length > 10) {
  //   console.log(`col metadata: ${JSON.stringify(columnMetadata, null, 2)}`)
  // }

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

  const sortedRows = rows.map(item => Object.values(item))
  return (
    <View style={styles.container}>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <View style={styles.tableWrapper}>
          <Table borderStyle={styles.tableBorder}>
            <Row
              data={headerList}
              widthArr={widthArr}
              style={styles.header}
              // textStyle={styles.headerText}
            />
          </Table>
          <Table borderStyle={styles.tableBorder}>
            {sortedRows.map((row, index) => (
              <Row
                key={`${index}`}
                data={getStyledRowData(columns, columnMetadata, row)}
                widthArr={widthArr}
                style={[styles.row, index % 2 && styles.rowEven]}
              />
            ))}
          </Table>
        </View>
      </ScrollView>
    </View>
  )
}

export default React.memo(TableContainer)

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: '#fff',
    // backgroundColor: 'red',
    borderRadius: 8,
    // borderWidth: 2,
    // borderColor: '#EAFAEA',
  },
  tableWrapper: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#EAFAEA',
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
    color: '#201D1D',
  },
  cell: {
    marginHorizontal: 6,
    color: '#014E40',
  },
  number: { textAlign: 'right' },
  tableBorder: {
    // borderWidth: 1,
    // borderColor: '#FFFFFF' /* '#C1C0B9' */,
  },
  row: {
    height: 40,
    backgroundColor: '#FFFFFF' /* '#E7E6E1' */,
  },
  rowEven: {
    backgroundColor: '#f0fcf4' /* '#F0FBFC' '#F7F6E7' */,
  },
})
