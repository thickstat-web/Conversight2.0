import { View, Text } from 'react-native-ui-lib'
import React from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { Avatar } from 'react-native-ui-lib'
import { ButtonCustom } from '@/Components'
import { useTheme } from '@/Hooks'

const AvatarChanged = () => {
  const { Colors, Layout, Fonts } = useTheme()

  return (
    <ScrollView contentContainerStyle={[Layout.center, { flex: 1 }]}>
      <View flex-10 center>
        <Avatar size={150} />
        <Text marginT-25 center color={Colors.GREEN_DARK} style={[Fonts.textRegularBold, { fontSize: 24, lineHeight: 30 }]} >
          Your profile avatar {"\n"}
          has been set
        </Text>
      </View>
      <View marginB-20 flex-1 bottom >
      </View>
    </ScrollView>
  )
}

export default AvatarChanged