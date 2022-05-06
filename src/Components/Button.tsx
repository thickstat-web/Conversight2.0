import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from '@/Hooks'

interface Props {
  dark?: boolean
  block?: boolean
  children?: string
  loading?: boolean
  onPress?: () => void
  style?: any
}

const Button = ({ dark, block, loading, children, onPress, style }: Props) => {
  const { Colors, Common, Fonts, Gutters, Layout } = useTheme()
  return (
    <View
      style={[
        !block && Layout.rowCenter,
        Array.isArray(style) ? style : { ...style },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={[
          Common.button.curved,
          Layout.row,
          Layout.rowHCenter,
          dark && Common.backgroundDarkPrimary,
        ]}
      >
        {loading && (
          <ActivityIndicator
            color={Colors.white}
            style={[Gutters.smallRMargin]}
          />
        )}
        <Text style={[Fonts.textBoldContrast]}>{children}</Text>
      </TouchableOpacity>
    </View>
  )
}

Button.defaultProps = {
  dark: false,
  block: false,
  children: '',
  loading: false,
  onPress: () => {},
  style: {},
}

export default Button
