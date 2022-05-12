import { View, Text, ComponentsColors } from 'react-native-ui-lib'
import React from 'react'
import { ButtonCustom } from '@/Components'
import { useTheme } from '@/Hooks'
import { Animated, StyleSheet, Dimensions } from 'react-native'
import { WALK_DATA } from '@/Constants/data'

const { height: screenHeight, width: screenWidth } = Dimensions.get('screen')

const WalkThrough = () => {
  const { Colors, Fonts } = useTheme()
  let scrollX = React.useRef(new Animated.Value(0)).current
  const [dotPosition, setDotPosition] = React.useState(
    Animated.divide(scrollX, screenWidth),
  )

  //   scrollX.addListener(({ value }) => {
  //     console.log(value, scrollX)
  //   })

  const handleNext = () => {
    // handle screen component change
  }

  return (
    <View style={{ backgroundColor: '#FFF' }} flex bottom center marginB-20>
      <Animated.ScrollView
        horizontal
        scrollEnabled
        pagingEnabled
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        decelerationRate={0}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
      >
        {WALK_DATA.map(({ title, description }, i) => {
          return (
            <View
              flex
              bottom
              key={i}
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
                {title}
              </Text>
              <Text center style={{ ...Fonts.textSmall, height: 130 }}>
                {description}
              </Text>
            </View>
          )
        })}
      </Animated.ScrollView>
      <View style={styles.dotsBox}>
        {WALK_DATA.map((x, index) => {
          //   console.log(dotPosition)

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
      <ButtonCustom
        action={handleNext}
        label="Next"
        color={Colors.GREEN_DARK}
      />
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
})

export default WalkThrough
