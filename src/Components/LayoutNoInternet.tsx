import { StyleSheet } from 'react-native'
import { Text, View } from 'react-native-ui-lib'
import React from 'react'
import NetInfo from '@react-native-community/netinfo'
import { useTheme } from '@/Hooks'

interface Props {
  children: any
}

const LayoutNoInternet = ({ children }: Props) => {
  const [connected, setConnected] = React.useState(true)
  const { Colors } = useTheme()

  const cb = (x: any) => {
    if (x !== connected) {
      setConnected(x)
    }
  }
  const unsubscribe = NetInfo.addEventListener((state: any) => {
    // console.log('Is connected?', state.isConnected);
    cb(state.isConnected)
  })

  return (
    <>
      {!connected && (
        <View style={{ ...styles.root, backgroundColor: Colors.DARK_BLUE }}>
          <Text center style={{ ...styles.text, color: Colors.WHITE }}>
            No internet Connection
          </Text>
        </View>
      )}

      {children}
    </>
  )
}
const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    width: '100%',
    alignSelf: 'center',
  },
  text: {
    lineHeight: 20,
  },
})

export default LayoutNoInternet
