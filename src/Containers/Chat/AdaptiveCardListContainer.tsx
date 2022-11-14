import React, { useState } from 'react'
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

function AdaptiveCardListContainer({
  id,
  columns,
  columnMetadata,
  values,
  expandAll,
}: AdaptiveCardListContainerProps) {
  const { Layout, Colors, Common, Fonts } = useTheme()

  const renderAdaptiveCardItem = ({ item: row, index }: ItemProps) => {
    return (
      <View marginB-10>
        <AdaptiveCard
          columns={columns}
          columnMetadata={columnMetadata}
          values={[row]}
          expanedeView={expandAll}
          expandable={true}
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={values}
        // initialNumToRender={20}
        // getItemLayout={getItemLayout}
        renderItem={renderAdaptiveCardItem}
        style={{ paddingBottom: 200 }}
        listKey={id}
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
