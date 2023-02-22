import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { Image, View, Text } from 'react-native-ui-lib'
import { Colors } from '@/Theme/Variables'
import AthenaIcon from '@/Assets/Images/iconsSVG/athena.svg'

type DidYouMeanProps = {
  title: string
  handleSendMessage: (utterance: string) => void
  suggestion: string[]
}

function DidYouMean({ title, suggestion, handleSendMessage }: DidYouMeanProps) {
  const renderedItems = suggestion.map((item, index) => (
    <View key={index} style={styles.suggestionList}>
      <Text
        style={styles.suggestionTextStyle}
        onPress={() => handleSendMessage(item)}
      >
        {item}
      </Text>
    </View>
  ))

  return (
    <View style={styles.titleStyle}>
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.titleTextStyle}>{title}</Text>
      </View>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <View style={styles.athenaIcon}>
          <Image source={AthenaIcon} />
        </View>
        <View></View>
        {renderedItems}
      </ScrollView>
    </View>
  )
}

export default DidYouMean

const styles = StyleSheet.create({
  athenaIcon: {
    width: 40,
    height: 40,
    transform: [{ scale: 0.48 }],
  },
  suggestionList: {
    flexDirection: 'row',
    flexGrow: 0,
    marginHorizontal: 6,
    marginVertical: 4,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#a2f2a2',
    borderRadius: 20,
    backgroundColor: Colors.GREEN_LIGHTEST,
    padding: 4,
  },
  suggestionTextStyle: {
    color: Colors.GREEN_MAIN,
    paddingLeft: 4,
    paddingRight: 4,
  },
  titleStyle: {
    borderTopStartRadius: 8,
    borderTopEndRadius: 8,
    backgroundColor: Colors.GRAY,
  },
  titleTextStyle: {
    color: Colors.GREEN_MAIN,
    paddingLeft: 10,
    paddingTop: 10,
    fontWeight: 'bold',
  },
})
