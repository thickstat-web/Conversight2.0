import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/Hooks'
import { properCase } from '@/Utils/common'
import { ColumnMetadata } from '@/Types/ChatHistory'

export interface AdaptiveCardProps {
  columnMetadata: ColumnMetadata
  values: Array<Record<string, any>>
}

const AdaptiveCard = ({ columnMetadata, values }: AdaptiveCardProps) => {
  const { Colors } = useTheme()
  const row = values[0]
  const rowValues = Object.entries(row)
  const renderedRow = rowValues.map(([col, val], index) => {
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

  return <View>{renderedRow}</View>
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
