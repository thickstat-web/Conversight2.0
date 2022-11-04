import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native'
import { View } from 'react-native-ui-lib'
import { Table, Row } from 'react-native-table-component'
import _ from 'lodash'
import DownArrow from '@/Assets/Images/drawer/down-arrow.svg'
import UpArrow from '@/Assets/Images/drawer/up-arrow.svg'
import { ColumnMetadata } from '@/Types/ChatHistory'
import { properCase, getFormattedRowData } from '@/Utils/common'
import { AdaptiveCard } from '@/Components'
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

function TableContainer({ id, columns, columnMetadata, values }: TableProps) {
  const columnWidth = columns.length <= 2 ? 160 : 120
  const ROW_HEIGHT = 40
  const widthArr = new Array(columns.length).fill(columnWidth)
  const { Layout, Colors, Common, Fonts } = useTheme()
  const [direction, setDirection] = useState<string | null>(null)
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null)
  const [rows, setRows] = useState(values)

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
      style={[styles.row, index % 2 === 1 && styles.rowOdd]}
    />
  )

  // const sortedRows = rows.map(item => Object.values(item))
  const getItemLayout = (data: any, index: number) => ({
    length: ROW_HEIGHT,
    offset: ROW_HEIGHT * index,
    index,
  })

  const isSingleRecord = values.length === 1

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {isSingleRecord ? (
          <AdaptiveCard
            columns={columns}
            columnMetadata={columnMetadata}
            values={values}
            expanedeView={false}
          />
        ) : (
          <FlatList
            data={rows}
            initialNumToRender={20}
            style={styles.tableWrapper}
            // contentContainerStyle={styles.tableWrapper}
            ListHeaderComponent={
              <Table>
                <Row
                  data={headerList}
                  widthArr={widthArr}
                  style={styles.header}
                  // textStyle={styles.headerText}
                />
              </Table>
            }
            showsHorizontalScrollIndicator={false}
            getItemLayout={getItemLayout}
            renderItem={renderItem}
            listKey={id}
          />
        )}
      </ScrollView>
    </View>
  )
}

export default React.memo(TableContainer)

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: '#fff',
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
    color: '#4d4d4d',
  },
  cell: {
    marginHorizontal: 6,
    color: '#595959',
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
  rowOdd: {
    backgroundColor: '#f0fcf4' /* '#F0FBFC' '#F7F6E7' */,
  },
})
