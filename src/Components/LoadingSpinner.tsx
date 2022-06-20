import React from 'react'
import { ActivityIndicator } from 'react-native'
import { View } from 'react-native-ui-lib'
import { useTheme } from '@/Hooks'

const LoadingSpinner = () => {
  const { Colors } = useTheme()
  return (
    <View flex center>
      <ActivityIndicator size={'large'} color={Colors.GREEN_MAIN} />
    </View>
  )
}

export default LoadingSpinner
