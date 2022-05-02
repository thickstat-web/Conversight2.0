import React from 'react'
import {
  View,
  ActivityIndicator,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand } from '@/Components'
import { useTheme } from '@/Hooks'
import { useSignInMutation } from '@/Services/modules/auth'
import { TouchableOpacity } from 'react-native-gesture-handler'

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

  const handleSignIn = () => {
    signIn(authData)
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
        <Brand />
        {isLoading && <ActivityIndicator />}
        {isSuccess && (
          <Text style={Fonts.textRegular}>
            {t('signin.orgName', { name: data?.displayName })}
          </Text>
        )}
        <TouchableOpacity onPress={handleSignIn} style={styles.signInButton}>
          <Text style={[Fonts.textRegular, styles.signInButtonText]}>
            {'signin.buttons.signIn'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default LoginContainer

const styles = StyleSheet.create({
  signInButton: {
    backgroundColor: '#196F3D',
    borderRadius: 8,
    margin: 24,
    paddingHorizontal: 48,
    paddingVertical: 12,
  },
  signInButtonText: { color: 'white' },
})
