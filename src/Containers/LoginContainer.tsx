import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Button } from '@/Components'
import { useTheme } from '@/Hooks'
import { useSignInMutation } from '@/Services/modules/auth'

const LoginContainer = () => {
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

  const handleSignIn = () => signIn(authData)

  return (
    <ScrollView
      style={Layout.fill}
      contentContainerStyle={[Layout.fill, Gutters.largeHMargin]}
    >
      <View style={[Layout.fill, Layout.center]}>
        <Brand />
      </View>
      <View style={[Layout.fill, Layout.justifyContentEnd]}>
        {isSuccess && (
          <View style={[Gutters.largeBMargin, Layout.center]}>
            <Text style={Fonts.textNormal}>
              {t('signin.orgName', { name: data?.displayName })}
            </Text>
          </View>
        )}
        <Button
          block={true}
          dark={true}
          loading={isLoading}
          onPress={handleSignIn}
        >
          {t('signin.buttons.signIn')}
        </Button>
        <View style={[Gutters.largeVMargin, Layout.center]}>
          <Text style={[Fonts.textBold, Fonts.textPrimary]}>
            {t('signin.signupLater')}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default LoginContainer
