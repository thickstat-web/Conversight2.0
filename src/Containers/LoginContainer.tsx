import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Button } from '@/Components'
import { useTheme } from '@/Hooks'
import { useSignInMutation } from '@/Services/modules/auth'
import { processJQL } from '../../test-data/process'
// import WebView from 'react-native-webview'
// import { useWebViewMessage } from 'react-native-react-bridge'
// import webApp from './WebApp'

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

  // const { ref, onMessage, emit } = useWebViewMessage(message => {
  //   // emit sends message to React
  //   //   type: event name
  //   //   data: some data which will be serialized by JSON.stringify
  //   console.log(`[LoginContainer] message: ${JSON.stringify(message, null, 2)}`)
  //   if (message.type === 'hello') {
  //     emit({ type: 'success', data: 'succeeded!' })
  //   }
  // })

  return (
    <ScrollView
      style={Layout.fill}
      contentContainerStyle={[Layout.fill, Gutters.largeHMargin]}
    >
      <View style={[Layout.fill, Layout.center]}>
        <Brand />
      </View>
      {/* <WebView
        ref={ref}
        source={{ html: webApp }}
        onMessage={onMessage}
        onError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent
          console.error('WebView error: ', nativeEvent)
        }}
      /> */}
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
        <Button
          block={true}
          dark={true}
          loading={isLoading}
          onPress={processJQL}
          style={[Gutters.largeVMargin]}
        >
          {'Process JSQL'}
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
