import { StyleSheet, useWindowDimensions, View } from 'react-native'
import React from 'react'
import { WebView } from 'react-native-webview'
import { useAppSelector } from '@/Hooks'
import { selectConverseData } from '@/Store/App'

type WebExplorerContainerProps = {
  navigation: any
  route: {
    params: {
      formats: string[]
    }
  }
}

const WebExplorerContainer = ({
  navigation,
  route,
}: WebExplorerContainerProps) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const converseData = useAppSelector(selectConverseData)
  const { url } = route.params
  // const message = converseData[id][0]
  return (
    <View style={{ flex: 1 }}>
      <WebView source={{ uri: url }} style={{ flex: 1 }} />
    </View>
  )
}

export default WebExplorerContainer

const styles = StyleSheet.create({})
