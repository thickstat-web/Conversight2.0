import React, { useEffect } from 'react'
import { StyleSheet, FlatList } from 'react-native'
import { View } from 'react-native-ui-lib'
import { ColumnMetadata } from '@/Types/ChatHistory'
import { AdaptiveCard } from '@/Components'
import { useTheme } from '@/Hooks'

interface AdaptiveCardListContainerProps {
  id: string
  columns: string[]
  columnMetadata: ColumnMetadata
  values: Array<Record<string, any>>
  expandAll: boolean
}

interface ItemProps {
  item: Record<string, any>
  index: number
}

const renderAdaptiveCardItem =
  (columns: string[], columnMetadata: ColumnMetadata, expandAll: boolean) =>
  ({ item: row, index }: ItemProps) => {
    return (
      <AdaptiveCard
        id={index}
        columns={columns}
        columnMetadata={columnMetadata}
        row={row}
        expandAll={expandAll}
        expandable={true}
      />
    )
  }

const keyExtractor = (_: Record<string, any>, index: number) => {
  return `${index}`
}

const Separator = () => <View marginV-5 />

function AdaptiveCardListContainer({
  id,
  columns,
  columnMetadata,
  values,
  expandAll,
}: AdaptiveCardListContainerProps) {
  const { Layout, Colors, Common, Fonts } = useTheme()

  return (
    <View key={id} style={styles.container}>
      <FlatList
        data={values}
        contentContainerStyle={{ flex: 1 }}
        renderItem={renderAdaptiveCardItem(columns, columnMetadata, expandAll)}
        initialNumToRender={25}
        keyExtractor={keyExtractor}
        listKey={id}
        ItemSeparatorComponent={Separator}
        style={{ paddingBottom: 200 }}
      />
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
