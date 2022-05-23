import React, { useCallback, useEffect, useRef } from 'react'
import { Animated, Dimensions, StyleSheet } from 'react-native'
// import { useTranslation } from 'react-i18next'
import { useTheme } from '@/Hooks'
import SearchBar from './Searchbar'
import SearchResult from './SearchResult'

declare type SearchContainerProps = {
  visible: boolean
  onCancel: () => void
}

function SearchContainer({
  visible,
  onCancel,
}: SearchContainerProps): JSX.Element {
  const { Gutters, Layout, Colors, Common, Fonts } = useTheme()
  const { height: screenHeight } = Dimensions.get('window')
  const fadeAnim = useRef(new Animated.Value(0)).current

  const fadeIn = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  const fadeOut = useCallback(() => {
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
        styles.searchContainer,
        {
          backgroundColor: Colors.GRAY,
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [screenHeight + 10, 0],
              }),
            },
          ],
        },
      ]}
    >
      <SearchBar onCancel={onCancel} />
      <SearchResult visible={true} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  searchContainer: {
    zIndex: 1,
  },
  fadingText: {
    fontSize: 28,
  },
})

export default SearchContainer
