import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import { View } from 'react-native-ui-lib'
import { COLLAPSE, DEFAULT_ADAPTIVE_CARD_ROWS, EXPAND } from '@/Config'
import { useTheme } from '@/Hooks'
import { Colors } from '@/Theme/Variables'
import { ExpandButton } from '@/Components'
import { getFormattedRowData, properCase } from '@/Utils/common'
import { ColumnMetadata } from '@/Types/ChatHistory'

export interface AdaptiveCardProps {
  id: number | string
  columns: string[]
  columnMetadata: ColumnMetadata
  row: Record<string, any>
  expandAll: boolean
  expandable: boolean
}

const AdaptiveCard = ({
  id,
  columns,
  columnMetadata,
  row,
  expandAll = true,
  expandable = true,
}: AdaptiveCardProps) => {
  const { Colors } = useTheme()
  const [expanded, setExpanded] = useState(expandAll)
  const rowValues = Object.entries(row)
  const totalRows = rowValues.length

  const formattedValues = useMemo(
    () => getFormattedRowData(columns, columnMetadata, row),
    [columnMetadata, columns, row],
  )

  useEffect(() => {
    setExpanded(expandAll)
  }, [expandAll])

  const renderedRow = useMemo(() => {
    return columns
      .slice(0, expanded ? totalRows : DEFAULT_ADAPTIVE_CARD_ROWS)
      .map((col, colIndex) => {
        const val = formattedValues[colIndex]
        return (
          <View
            key={colIndex}
            style={[
              styles.adaptiveCardItem,
              { backgroundColor: colIndex % 2 === 0 ? '#f0fcf4' : '' },
            ]}
          >
            {columnMetadata[col] && (
              <View style={styles.titleColumn}>
                <Text
                  style={[{ color: Colors.GREEN_MAIN }, styles.propertyName]}
                >
                  {properCase(columnMetadata[col].alias)}
                </Text>
              </View>
            )}

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
  }, [
    Colors.GREEN_LIGHTEST,
    Colors.GREEN_MAIN,
    columnMetadata,
    columns,
    expanded,
    formattedValues,
    totalRows,
  ])

  return (
    <>
      <View style={styles.cardContainer}>{renderedRow}</View>

      {totalRows > DEFAULT_ADAPTIVE_CARD_ROWS && (
        <View row paddingH-12 right style={styles.cardFooter}>
          {!expanded && (
            <Text style={styles.bottomCount}>
              Showing {DEFAULT_ADAPTIVE_CARD_ROWS} of {totalRows} rows
            </Text>
          )}
          {expandable && (
            <ExpandButton
              collapsedText={COLLAPSE}
              expandedText={EXPAND}
              expanded={expanded}
              onPress={() => setExpanded(!expanded)}
            />
          )}
        </View>
      )}
    </>
  )
}

export default React.memo(AdaptiveCard)

const styles = StyleSheet.create({
  cardContainer: {
    margin: 2,
    minWidth: 300,
    borderWidth: 1,
    borderColor: '#EAFAEA',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,

    /* For box shadow */
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,

    elevation: 2,
  },
  adaptiveCardItem: {
    flexDirection: 'row',
  },
  titleColumn: {
    flex: 1,
    paddingHorizontal: 6,
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
  bottomCount: {
    color: Colors.GREEN_MAIN,
  },
  cardFooter: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
