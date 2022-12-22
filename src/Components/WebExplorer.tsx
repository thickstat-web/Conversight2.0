import React from 'react'
import { StyleSheet } from 'react-native'
import WebView from 'react-native-webview'
import LoadingSpinner, { SizeOptions } from './LoadingSpinner'

type WebExplorerProps = {
  url: string
  loaderSize: SizeOptions
}

export default function WebExplorer({ url, loaderSize }: WebExplorerProps) {
  return (
    <WebView
      containerStyle={styles.container}
      source={{
        uri: url,
      }}
      startInLoadingState={true}
      renderLoading={() => (
        <LoadingSpinner style={styles.activityContainer} size={loaderSize} />
      )}
      scalesPageToFit
      showsHorizontalScrollIndicator={false}
    />
  )
}

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
