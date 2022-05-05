import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, ButtonCustom } from '@/Components'
import { useTheme } from '@/Hooks'
import { useSignInMutation } from '@/Services/modules/auth'
import { ENTER_EMAIL_SCREEN } from '@/Constants/screens'
import { Colors } from '@/Theme/Variables'
import { Text, View } from 'react-native-ui-lib'

type LoginProps = {
  navigation: any
}

const LandingContainer = ({ navigation }: LoginProps) => {
  const { t } = useTranslation()
  const { Fonts, Gutters, Layout } = useTheme()
  const [signIn, { data, isLoading, isSuccess }] = useSignInMutation()

  const authData = {
    email: 'athena@conversight.ai',
    password: 'Login!23',
    deviceId: 'Web',
    deviceName: 'mobile',
    orgId: 'a8440c42-0aff-4619-be31-ee4d0eec6440',
  }

  const handleRedirect = () => {
    // signIn(authData)
    navigation.navigate(ENTER_EMAIL_SCREEN)
  }

  return (
    <ScrollView
      style={Layout.fill}
      contentContainerStyle={[
        Layout.fill,
        Layout.colCenter,
        Gutters.smallHPadding,
      ]}
    >
      <View style={[[Layout.colCenter, Gutters.smallHPadding]]}>
        <View marginT-30>
          <Brand />
        </View>
        <View flex bottom>
          <Text style={{ ...Fonts.textRegular, color: Colors.GREEN_DARK }}>
            Actionable Insights.
          </Text>
          <Text style={{ ...Fonts.textRegular, color: Colors.GREEN_DARK }}>
            Instantly. Anywhere.
          </Text>
        </View>
        <View flex bottom style={styles.btnBox}>
          <ButtonCustom
            action={handleRedirect}
            label="Login"
            color={Colors.GREEN_MAIN}
          />
          <ButtonCustom label="Request a Demo" color={Colors.GREEN_DARK} />
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  btnBox: {
    marginBottom: 30,
  },
})

export default LandingContainer
