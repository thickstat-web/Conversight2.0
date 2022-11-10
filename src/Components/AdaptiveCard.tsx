import React, { useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import { View } from 'react-native-ui-lib'
import { DEFAULT_ADAPTIVE_CARD_ROWS } from '@/Config'
import { useTheme } from '@/Hooks'
import { ExpandButton } from '@/Components'
import { getFormattedRowData, properCase } from '@/Utils/common'
import { ColumnMetadata } from '@/Types/ChatHistory'

export interface AdaptiveCardProps {
  columns: string[]
  columnMetadata: ColumnMetadata
  values: Array<Record<string, any>>
  expanedeView: boolean
  expandable: boolean
}

const AdaptiveCard = ({
  columns,
  columnMetadata,
  values,
  expanedeView = true,
  expandable = true,
}: AdaptiveCardProps) => {
  const { Colors } = useTheme()
  const [expanded, setExpanded] = useState(expanedeView)
  const [row] = values
  const rowValues = Object.entries(row)
  const formattedValues = getFormattedRowData(columns, columnMetadata, row)

  const renderedRow = columns
    .slice(0, expanded ? rowValues.length : DEFAULT_ADAPTIVE_CARD_ROWS)
    .map((col, index) => {
      const val = formattedValues[index]
      return (
        <View
          key={index}
          style={[
            styles.adaptiveCardItem,
            // { borderBottomWidth: 1, borderBottomColor: '#EAFAEA' },
            { backgroundColor: index % 2 === 0 ? '#f0fcf4' : '' },
          ]}
        >
          <View style={styles.titleColumn}>
            <Text style={[{ color: Colors.GREEN_MAIN }, styles.propertyName]}>
              {properCase(columnMetadata[col].alias)}
            </Text>
          </View>

          <View style={styles.valueColumn}>
            <Text
              style={styles.propertyValue}
              selectable={true}
              selectionColor={Colors.GREEN_LIGHTEST}
            >
              {val}
            </Text>
          </View>
        </View>
      )
    })

  return (
    <View style={styles.cardContainer}>
      {renderedRow}
      {expandable && rowValues.length > DEFAULT_ADAPTIVE_CARD_ROWS && (
        <View row right padding-10>
          <ExpandButton
            collapsedText="Collapse"
            expandedText="Expand"
            expanded={expanded}
            onPress={() => setExpanded(!expanded)}
          />
        </View>
      )}
    </View>
  )
}

export default React.memo(AdaptiveCard)

const styles = StyleSheet.create({
  cardContainer: {
    // margin: 2,
    borderWidth: 2,
    // borderBottomWidth: 0,
    borderColor: '#EAFAEA',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,

    /* For box shadow */
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2,

    elevation: 2,
  },
  adaptiveCardItem: {
    flexDirection: 'row',
  },
  titleColumn: {
    flex: 1,
    padding: 4,
    paddingVertical: 8,
  },
  valueColumn: {
    flex: 2,
    padding: 4,
    paddingVertical: 8,
  },
  propertyName: {
    fontWeight: '500',
  },
  propertyValue: {
    color: '#595959',
  },
})
