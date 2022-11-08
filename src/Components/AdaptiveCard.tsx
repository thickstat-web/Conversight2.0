import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { View } from 'react-native-ui-lib'
import { SvgCss } from 'react-native-svg'
import { DEFAULT_ADAPTIVE_CARD_ROWS } from '@/Config'
import { useTheme } from '@/Hooks'
import { getFormattedRowData, properCase } from '@/Utils/common'
import { ColumnMetadata } from '@/Types/ChatHistory'
import upArrow from '@/Assets/Images/xml-svg/upArrow'
import downArrow from '@/Assets/Images/xml-svg/downArrow'

export interface AdaptiveCardProps {
  columns: string[]
  columnMetadata: ColumnMetadata
  values: Array<Record<string, any>>
  expanedeView: boolean
}

const AdaptiveCard = ({
  columns,
  columnMetadata,
  values,
  expanedeView = true,
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
      {rowValues.length > DEFAULT_ADAPTIVE_CARD_ROWS && (
        <View row right padding-10>
          <TouchableOpacity
            style={{ flexDirection: 'row' }}
            onPress={() => setExpanded(!expanded)}
          >
            <Text
              style={[
                {
                  color: Colors.GREEN_MAIN,
                },
                styles.expandCollapseStyle,
              ]}
            >
              {expanded ? 'Collapse' : 'Expand'}
            </Text>
            <SvgCss
              width="10"
              height="10"
              xml={expanded ? upArrow : downArrow}
              style={{ marginTop: 4, marginHorizontal: 4 }}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default AdaptiveCard

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
    paddingHorizontal: 2,
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
  expandCollapseStyle: {
    textDecorationLine: 'underline',
    letterSpacing: 0.8,
  },
})
