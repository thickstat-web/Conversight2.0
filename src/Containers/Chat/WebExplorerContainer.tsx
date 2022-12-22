import { ActivityIndicator, StyleSheet, View } from 'react-native'
import React from 'react'
import { WebView } from 'react-native-webview'
import { useAppSelector } from '@/Hooks'
import { selectConverseData } from '@/Store/App'
import { Colors } from '@/Theme/Variables'

type WebExplorerContainerProps = {
  navigation: any
  route: {
    params: {
      formats: string[]
    }
  }
}

const Spinner = () => (
  <View style={styles.activityContainer}>
    <ActivityIndicator size="large" color={Colors.GREEN_MAIN} />
  </View>
)

const WebExplorerContainer = ({
  navigation,
  route,
}: WebExplorerContainerProps) => {
  const converseData = useAppSelector(selectConverseData)
  const { url } = route.params
  // const message = converseData[id][0]
  return (
    <WebView
      containerStyle={{ flex: 1 }}
      source={{ uri: url }}
      startInLoadingState={true}
      renderLoading={Spinner}
      scalesPageToFit
      showsHorizontalScrollIndicator={false}
    />
  )
}

export default WebExplorerContainer

const styles = StyleSheet.create({
  activityContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -40,
    left: 0,
    height: '100%',
    width: '100%',
  },
})
