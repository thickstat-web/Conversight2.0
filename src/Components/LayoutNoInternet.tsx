import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { Text, View } from 'react-native-ui-lib'
import NetInfo, {
  NetInfoState,
  useNetInfo,
} from '@react-native-community/netinfo'
import { useTheme } from '@/Hooks'
import NoInternetIcon from '@/Assets/Images/no-internet.svg'
interface Props {
  children: any
}

const LayoutNoInternet = ({ children }: Props) => {
  const [connected, setConnected] = React.useState(true)
  const { Colors } = useTheme()
  const { isConnected } = useNetInfo()

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      // console.log(`[NoInternerConnection] isConnected: ${state.isConnected}`)
      setConnected(state.isConnected)
    })

    return () => unsubscribe()
  }, [])

  return (
    <>
      {!isConnected && (
        <View style={{ ...styles.root, backgroundColor: Colors.DARK_BLUE }}>
          <NoInternetIcon />
          <Text style={{ ...styles.text, color: Colors.WHITE }}>
            No internet Connection Available
          </Text>
        </View>
      )}

      {children}
    </>
  )
}
const styles = StyleSheet.create({
  root: {
    top: 0,
    position: 'absolute',
    width: '100%',
    alignSelf: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  text: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 15,
    lineHeight: 20,
    paddingLeft: 10,
  },
})

export default LayoutNoInternet
