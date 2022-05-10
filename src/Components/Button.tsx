import React from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { useTheme } from '@/Hooks'

interface Props {
  dark?: boolean
  block?: boolean
  label?: string
  loading?: boolean
  disabled?: boolean
  onPress?: (...args: any) => any
  style?: any
}

const Button = ({
  dark,
  block,
  loading,
  disabled,
  label,
  onPress,
  style,
}: Props) => {
  const { Colors, Common, Fonts, Gutters, Layout } = useTheme()
  const disabledStyle = { opacity: 0.6 }
  return (
    <View
      style={[
        !block && Layout.rowCenter,
        Array.isArray(style) ? style : { ...style },
      ]}
    >
      <Pressable
        onPress={loading || disabled ? null : onPress}
        style={[
          Common.button.curved,
          Layout.row,
          Layout.rowHCenter,
          dark ? Common.backgroundDarkPrimary : Common.backgroundPrimary,
          (loading || disabled) && disabledStyle,
        ]}
      >
        {loading && (
          <ActivityIndicator
            color={Colors.WHITE}
            style={[Gutters.smallRMargin]}
          />
        )}
        <Text style={[Fonts.textNormalContrast]}>{label}</Text>
      </Pressable>
    </View>
  )
}

Button.defaultProps = {
  dark: false,
  block: false,
  label: '',
  disabled: false,
  loading: false,
  onPress: () => {},
  style: {},
}

export default Button
