import { View, Text } from 'react-native-ui-lib'
import React from 'react'
import { useTheme } from '@/Hooks'
import { StyleSheet } from 'react-native'

interface Props {
  title: string
  content: string
}

const Summary = ({ title, content }: Props) => {
  const { Colors, Fonts } = useTheme()

  return (
    <View
      br30
      marginV-5
      style={{ ...styles.root, backgroundColor: Colors.GRAY }}
    >
      <Text
        style={{
          ...styles.title,
          ...Fonts.textRegularBold,
          color: Colors.GREEN_DARK,
        }}
      >
      {title}
      </Text>
      <Text style={{ ...Fonts.textSmall, fontSize: 14 }}>
        Content Content Content Content Content Content Content Content Content
        Content Content Content Content Content Content Content Content Content
        Content Content Content Content Content Content
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    padding: 15,
  },
  title: {
    marginBottom: 10,
  },
})

export default Summary
