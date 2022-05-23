import React, { ReactNode } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import { useTheme } from '@/Hooks'

interface Props {
  icon?: ReactNode
  loading?: boolean
  disabled?: boolean
  onPress?: (...args: any) => any
  style?: ViewStyle
}

const IconButton = ({ loading, disabled, icon, onPress, style }: Props) => {
  const { Colors, Common, Fonts, Gutters, Layout } = useTheme()
  const disabledStyle = { opacity: 0.6 }
  return (
    <Pressable
      onPress={loading || disabled ? undefined : onPress}
      style={[
        styles.iconContainer,
        Layout.center,
        (loading || disabled) && disabledStyle,
        {
          backgroundColor: Colors.GREEN_MAIN,
        },
        Array.isArray(style) ? style : { ...style },
      ]}
    >
      {loading ? <ActivityIndicator color={Colors.WHITE} /> : <>{icon}</>}
    </Pressable>
  )
}

IconButton.defaultProps = {
  icon: null,
  disabled: false,
  loading: false,
  onPress: () => {},
  style: {},
}

const styles = StyleSheet.create({
  iconContainer: {
    margin: 6,
    borderRadius: 25,
    height: 48,
    width: 48,
  },
})

export default IconButton
