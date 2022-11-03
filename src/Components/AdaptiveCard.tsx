import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { View } from 'react-native-ui-lib'
import { SvgCss } from 'react-native-svg'
import { DEFAULT_ADAPTIVE_CARD_ROWS } from '@/Config'
import { useTheme } from '@/Hooks'
import { properCase } from '@/Utils/common'
import { ColumnMetadata } from '@/Types/ChatHistory'
import upArrow from '@/Assets/Images/xml-svg/upArrow'
import downArrow from '@/Assets/Images/xml-svg/downArrow'

export interface AdaptiveCardProps {
  columnMetadata: ColumnMetadata
  values: Array<Record<string, any>>
  expanedeView: boolean
}

const AdaptiveCard = ({
  columnMetadata,
  values,
  expanedeView = true,
}: AdaptiveCardProps) => {
  const { Colors } = useTheme()
  const [expanded, setExpanded] = useState(expanedeView)
  const [row] = values
  const rowValues = Object.entries(row)

  const renderedRow = rowValues
    .slice(0, expanded ? rowValues.length : DEFAULT_ADAPTIVE_CARD_ROWS)
    .map(([col, val], index) => {
      return (
        <View
          key={index}
          style={[
            styles.adaptiveCardItem,
            // { borderBottomWidth: 1, borderBottomColor: '#EAFAEA' },
            { backgroundColor: index % 2 === 0 ? '#f0fcf4' : '' },
          ]}
        >
          <View style={[styles.adaptiveCardColumn]}>
            <Text style={[{ color: Colors.GREEN_MAIN }, styles.propertyName]}>
              {properCase(columnMetadata[col].alias)}
            </Text>
          </View>

          <View style={styles.adaptiveCardColumn}>
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
              style={{
                color: Colors.GREEN_MAIN,
                textDecorationLine: 'underline',
                letterSpacing: 0.4,
              }}
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
    margin: 2,
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
  adaptiveCardColumn: {
    width: 180,
    padding: 4,
    paddingVertical: 8,
  },
  adaptiveCardItem: {
    flexDirection: 'row',
  },
  propertyName: { fontWeight: '500' },
  propertyValue: { color: '#595959' },
})
