import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from '@/Hooks'

interface Props {
  dark?: boolean
  block?: boolean
  children?: string
  loading?: boolean
  onPress?: () => void
}

const Button = ({ dark, block, loading, children, onPress }: Props) => {
  const { Colors, Common, Fonts, Gutters, Layout } = useTheme()
  return (
    <View style={[!block && Layout.rowCenter]}>
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
}

export default Button
