import React, { ReactNode } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import { useTheme } from '@/Hooks'
import { Colors } from '@/Theme/Variables'

interface Props {
  icon?: ReactNode
  loading?: boolean
  loaderColor?: string
  disabled?: boolean
  onPress?: (...args: any) => any
  style?: ViewStyle
}

const IconButton = ({
  loading,
  loaderColor,
  disabled,
  icon,
  onPress,
  style,
}: Props) => {
  const { Layout } = useTheme()
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
      {loading ? <ActivityIndicator color={loaderColor} /> : <>{icon}</>}
    </Pressable>
  )
}

IconButton.defaultProps = {
  icon: null,
  disabled: false,
  loading: false,
  loaderColor: Colors.WHITE,
  onPress: () => {},
  style: {},
}

const styles = StyleSheet.create({
  iconContainer: {
    margin: 6,
    borderRadius: 25,
    height: 42,
    width: 42,
  },
})

export default IconButton
