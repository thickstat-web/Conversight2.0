import React, { useCallback, useEffect, useRef } from 'react'
import { Animated, Dimensions, StyleSheet, TextInput } from 'react-native'
import { Text, View } from 'react-native-ui-lib'
// import { useTranslation } from 'react-i18next'
import { useTheme } from '@/Hooks'

declare type SearchResultProps = {
  visible: boolean
}

function SearchResult({ visible }: SearchResultProps): JSX.Element {
  const { Gutters, Layout, Colors, Common, Fonts } = useTheme()
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
  // const searchRef = useRef<TextInput>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current

  const fadeIn = useCallback(() => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 50,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  const fadeOut = useCallback(() => {
    // Will change fadeAnim value to 0 in 3 seconds
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  useEffect(() => {
    visible ? fadeIn() : fadeOut()
  }, [fadeIn, fadeOut, visible])

  return (
    <Animated.View
      style={[
        styles.fadingContainer,
        {
          height: screenHeight,
          backgroundColor: Colors.GRAY,
          opacity: fadeAnim,
          // transform: [
          //   {
          //     translateY: fadeAnim.interpolate({
          //       inputRange: [0, 1],
          //       outputRange: [screenHeight + 100, 0], // 0 : 150, 0.5 : 75, 1 : 0
          //     }),
          //   },
          // ],
        },
      ]}
    >
      <View flex center>
        <Text style={styles.fadingText}>Search Result - In Progress!</Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  fadingContainer: {
    flex: 1,
    // height: 800,
    backgroundColor: 'red',
    zIndex: 10,
  },
  fadingText: {
    fontSize: 18,
  },
})

export default SearchResult
