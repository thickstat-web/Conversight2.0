import { View, Text } from 'react-native-ui-lib'
import React from 'react'
import { ButtonCustom } from '@/Components'
import { useTheme } from '@/Hooks'
import {
  Animated,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { WALK_DATA } from '@/Constants/data'
import BackIcon from '@/Assets/Images/iconsSVG/back.svg'
import { navigateAndSimpleReset } from '@/Navigators/utils'
import { DRAWER_NAVIGATOR } from '@/Constants/screens'

const { height: screenHeight, width: screenWidth } = Dimensions.get('screen')

const WalkThrough = () => {
  const { Colors, Fonts } = useTheme()
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0)
  const ref = React.useRef<any>()
  let scrollX = React.useRef(new Animated.Value(0)).current
  const dotPosition = Animated.divide(scrollX, screenWidth)

  const updateCurrentSlideIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x
    const currentIndex = Math.round(contentOffsetX / screenWidth)
    setCurrentSlideIndex(currentIndex)
  }

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1
    if (nextSlideIndex != WALK_DATA.length) {
      const offset = nextSlideIndex * screenWidth
      ref?.current.scrollToOffset({ offset })
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  const goToPrev = () => {
    const prevIndex = currentSlideIndex - 1
    if (prevIndex != WALK_DATA.length) {
      const offset = prevIndex * screenWidth
      ref?.current.scrollToOffset({ offset })
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  const handleComplete = () => {
    navigateAndSimpleReset(DRAWER_NAVIGATOR)
  }

  const Slide = ({ item }: any) => {
    return (
      <View
        flex
        bottom
        style={{
          width: screenWidth,
          padding: 25,
        }}
      >
        <Text
          style={{
            ...Fonts.text20Bold,
            padding: 10,
            color: Colors.GREEN_DARK,
          }}
          center
        >
          {item?.title}
        </Text>
        <Text center style={{ ...Fonts.textSmall, height: 130 }}>
          {item?.description}
        </Text>
      </View>
    )
  }

  return (
    <View style={{ backgroundColor: '#FFF' }} flex bottom center marginB-20>
      <View style={styles.appBar}>
        <View>
          {currentSlideIndex > 0 && (
            <TouchableOpacity onPress={goToPrev} style={styles.backIcon}>
              <BackIcon />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={handleComplete} style={styles.skip}>
          <Text style={Fonts.textRegularBold}>skip</Text>
        </TouchableOpacity>
      </View>

      <View flex bottom>
        <FlatList
          data={WALK_DATA}
          ref={ref}
          onMomentumScrollEnd={updateCurrentSlideIndex}
          contentContainerStyle={{ height: screenHeight * 0.68 }}
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false },
          )}
          horizontal
          pagingEnabled
          renderItem={({ item }) => <Slide item={item} />}
        />
      </View>

      <View style={styles.dotsBox}>
        {WALK_DATA.map((x, index) => {
          const dotOpacity = dotPosition.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0.2, 1, 0.2],
            extrapolate: 'clamp',
          })

          return (
            <Animated.View
              key={index}
              style={{
                ...styles.dot,
                opacity: dotOpacity,
              }}
            />
          )
        })}
      </View>

      {currentSlideIndex === WALK_DATA.length - 1 ? (
        <ButtonCustom
          action={handleComplete}
          label="Let's get Started"
          color={Colors.GREEN_DARK}
        />
      ) : (
        <ButtonCustom
          action={goToNextSlide}
          label="Next"
          color={Colors.GREEN_DARK}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  dotsBox: {
    display: 'flex',
    flexDirection: 'row',
  },
  dot: {
    width: 10,
    margin: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00AA39',
  },
  backIcon: {
    width: 50,
    margin: 16,
  },
  skip: {
    width: 50,
    margin: 20,
  },
  appBar: {
    width: screenWidth,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

export default WalkThrough
