import React from 'react'
import { ActivityIndicator } from 'react-native'
import { View } from 'react-native-ui-lib'
import { useTheme } from '@/Hooks'

type SizeOptions = number | 'large' | 'small' | undefined

interface SpinnerProps {
  size?: SizeOptions
}

const LoadingSpinner = ({ size }: SpinnerProps) => {
  const { Colors } = useTheme()
  return (
    <View flex center>
      <ActivityIndicator size={size} color={Colors.GREEN_MAIN} />
    </View>
  )
}

LoadingSpinner.defaultProps = {
  size: 'large',
}

export default LoadingSpinner
