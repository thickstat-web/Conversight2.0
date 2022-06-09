import { View, Text } from 'react-native-ui-lib'
import React from 'react'
import { Image } from 'react-native-ui-lib'
import { success } from '@/Components/Images'
import { useTheme } from '@/Hooks'
import { ButtonCustom } from '@/Components'
// import { NavigationProp, ParamListBase } from '@react-navigation/native'

interface Props {
  navigation: any
}

const DemoRequested = ({ navigation }: Props) => {
  const { Layout, Fonts, Colors } = useTheme()

  return (
    <View style={[Layout.colCenter, { flex: 1, marginHorizontal: 60 }]}>
      <View flex-6 style={[Layout.colHCenter]}>
        <Image source={success} />
      </View>

      <View flex-2 >
        <Text center marginB-5 style={[Fonts.text20Bold, { color: Colors.GREEN_DARK, fontFamily: "Montserrat-Bold" }]}>Thank you for  </Text>
        <Text center style={[Fonts.text20Bold, { color: Colors.GREEN_DARK, fontFamily: "Montserrat-Bold", marginBottom: 20 }]}>requesting a demo! </Text>

        <Text center style={[Fonts.textSmall]}>One of our representatives will be in touch with you soon.</Text>
      </View>
      <View flex-1>
        <ButtonCustom action={() => { navigation.pop(2) }} label='Back' color={Colors.GREEN_DARK} />
      </View>
    </View>
  )
}

export default DemoRequested