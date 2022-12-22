import React from 'react'
import { ActivityIndicator, ViewStyle } from 'react-native'
import { View } from 'react-native-ui-lib'
import { useTheme } from '@/Hooks'

export type SizeOptions = number | 'large' | 'small' | undefined

interface SpinnerProps {
  size?: SizeOptions
  style?: ViewStyle
}

const LoadingSpinner = ({ size, style }: SpinnerProps) => {
  const { Colors } = useTheme()
  return (
    <View flex center style={[style]}>
      <ActivityIndicator size={size} color={Colors.GREEN_MAIN} />
    </View>
  )
}

LoadingSpinner.defaultProps = {
  size: 'large',
  style: {},
}

export default LoadingSpinner
