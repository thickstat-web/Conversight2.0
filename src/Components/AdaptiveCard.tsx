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
}

const AdaptiveCard = ({ columnMetadata, values }: AdaptiveCardProps) => {
  const { Colors } = useTheme()
  const [expanded, setExpanded] = useState(false)
  const row = values[0]
  const rowValues = Object.entries(row)

  const renderedRow = rowValues
    .slice(0, expanded ? rowValues.length : DEFAULT_ADAPTIVE_CARD_ROWS)
    .map(([col, val], index) => {
      return (
        <View
          key={index}
          style={[
            styles.adaptiveCardContainer,
            { backgroundColor: index % 2 === 1 ? '#f0fcf4' : '' },
          ]}
        >
          <View style={styles.adaptiveCardProps}>
            <Text style={[{ color: Colors.GREEN_MAIN }, styles.propertyName]}>
              {properCase(columnMetadata[col].alias)}
            </Text>
          </View>

          <View style={styles.adaptiveCardProps}>
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
    <View>
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
  adaptiveCardProps: {
    width: 150,
    padding: 4,
    paddingVertical: 10,
  },
  adaptiveCardContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  propertyName: { fontWeight: '500' },
  propertyValue: { color: '#595959' },
})
