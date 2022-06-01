import React from 'react'
import { View, Text } from 'react-native-ui-lib'
import { useTheme } from '@/Hooks'
import { ButtonCustom } from '@/Components'
import { Image } from 'react-native'
import { success } from '@/Components/Images'

const RecoverComplete = () => {
  const { Layout, Fonts, Colors } = useTheme()

  return (
    <View
      marginB-20
      marginL-60
      marginR-60
      style={{ ...Layout.colCenter, flex: 1 }}
    >
      <Image source={success} style={{ width: 190, height: 190, top: 40 }} />
      <View flex bottom>
        <Text center style={Fonts.textLarge}>
          We’ve sent you an email
        </Text>
        <Text margin-20 center>
          Please follow the intructions in your email in order to reset your
          password.
        </Text>
      </View>
      <ButtonCustom label="Open Email" color={Colors.GREEN_DARK} />
    </View>
  )
}

export default RecoverComplete
