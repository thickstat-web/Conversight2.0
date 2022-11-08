import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native'
import { View } from 'react-native-ui-lib'
import { ColumnMetadata } from '@/Types/ChatHistory'
import { properCase, formatValue } from '@/Utils/common'
import { AdaptiveCard } from '@/Components'
import { useTheme } from '@/Hooks'

const getStyledRowData = (
  columns: string[],
  columnMetadata: ColumnMetadata,
  row: Record<string, any>,
) => {
  const dataFormatter = (column: string) => {
    const value = row[column]
    let metadata = columnMetadata[column] || null
    let isNumeric = metadata ? metadata.isNumericFormat : false
    let displayValue = value
    if (isNumeric) {
      const {
        prefix,
        roundedValue: text,
        suffix,
      } = formatValue(value, metadata)
      displayValue = `${prefix}${text} ${suffix}`.trim()
    }
    return (
      <Text numberOfLines={1} style={[styles.cell, isNumeric && styles.number]}>
        {displayValue}
      </Text>
    )
  }
  return columns.map(dataFormatter)
}

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

function AdaptiveCardListContainer({
  id,
  columns,
  columnMetadata,
  values,
}: TableProps) {
  // const ROW_HEIGHT = 40
  const { Layout, Colors, Common, Fonts } = useTheme()
  const [rows, setRows] = useState(values)

  const renderAdaptiveCardItem = ({ item: row, index }: ItemProps) => {
    return (
      <View marginB-10>
        <AdaptiveCard
          columns={columns}
          columnMetadata={columnMetadata}
          values={[row]}
          expanedeView={true}
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <FlatList
          data={rows}
          // initialNumToRender={20}
          // getItemLayout={getItemLayout}
          renderItem={renderAdaptiveCardItem}
          listKey={id}
        />
      </ScrollView>
    </View>
  )
}

export default React.memo(AdaptiveCardListContainer)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 2,
    // borderRadius: 8,
    // borderWidth: 2,
    // borderColor: '#EAFAEA',
  },
  cell: {
    marginHorizontal: 6,
    color: '#595959',
  },
  number: { textAlign: 'right' },
})
