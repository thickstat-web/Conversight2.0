import { Image, Text, View } from 'react-native-ui-lib'
import { ScrollView, StyleSheet } from 'react-native'

import AthenaIcon from '@/Assets/Images/iconsSVG/athena.svg'
import { Colors } from '@/Theme/Variables'
import React from 'react'

type FollowUpQuestionsProps = {
  suggestionList: string[]
  handleSendMessage: (utterance: string) => void
}

function FollowUpQuestions({
  suggestionList,
  handleSendMessage,
}: FollowUpQuestionsProps) {
  const renderedItems = suggestionList.map((item, index) => (
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
    // <View style={styles.followUpQuestions}>
    <View>
      <View
        style={{
          alignItems: 'center',
        }}
      >
        <Text style={{ color: Colors.GREEN_MAIN, fontWeight: 'bold' }}>
          Are you interested in,
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.athenaIcon}>
            <Image source={AthenaIcon} />
          </View>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            {renderedItems}
          </ScrollView>
        </View>
      </View>
    </View>
  )
}

export default FollowUpQuestions

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
  followUpQuestions: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 }, // change this for more shadow
    shadowOpacity: 0.4,
    shadowRadius: 6,
    borderWidth: 0.1,
    borderColor: 'white',
    elevation: 22,
  },
})
