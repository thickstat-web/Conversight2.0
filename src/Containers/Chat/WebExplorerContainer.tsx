import { StyleSheet } from 'react-native'
import React from 'react'
import { WebView } from 'react-native-webview'
import { LoadingSpinner } from '@/Components'

type WebExplorerContainerProps = {
  route: {
    params: {
      url: string
    }
  }
}

const WebExplorerContainer = ({ route }: WebExplorerContainerProps) => {
  const { url } = route.params

  return (
    <WebView
      containerStyle={styles.container}
      source={{ uri: url }}
      startInLoadingState={true}
      renderLoading={() => <LoadingSpinner style={styles.activityContainer} />}
      scalesPageToFit
      showsHorizontalScrollIndicator={false}
    />
  )
}

export default WebExplorerContainer

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
