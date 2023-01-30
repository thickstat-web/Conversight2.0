import React from 'react'
import { StyleSheet, FlatList } from 'react-native'
import { View } from 'react-native-ui-lib'
import { ColumnMetadata } from '@/Types/ChatHistory'
import { AdaptiveCard } from '@/Components'

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

const Separator = () => <View marginV-3 />

function AdaptiveCardListContainer({
  id,
  columns,
  columnMetadata,
  values,
  expandAll,
}: AdaptiveCardListContainerProps) {
  return (
    <FlatList
      contentContainerStyle={styles.containerStyle}
      data={values}
      renderItem={renderAdaptiveCardItem(columns, columnMetadata, expandAll)}
      showsVerticalScrollIndicator={false}
      initialNumToRender={25}
      maxToRenderPerBatch={25}
      removeClippedSubviews={true}
      keyExtractor={keyExtractor}
      listKey={id}
      ItemSeparatorComponent={Separator}
    />
  )
}

export default React.memo(AdaptiveCardListContainer)

const styles = StyleSheet.create({
  containerStyle: { paddingBottom: 150 },
})
