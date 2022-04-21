import React, { useState, useEffect } from 'react'
import {
  View,
  ActivityIndicator,
  Text,
  TextInput,
  ScrollView,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyVerifyEmailQuery } from '@/Services/modules/auth'

const VerifyEmailContainer = () => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()

  const [emailId, setEmailId] = useState('athena@conversight.ai')
  const [
    verifyEmail,
    { data, isLoading, isFetching },
  ] = useLazyVerifyEmailQuery()

  const isSuccess = data?.code === 200

  useEffect(() => {
    verifyEmail(emailId)
  }, [verifyEmail, emailId])

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
        {(isLoading || isFetching) && <ActivityIndicator />}
        {!isSuccess ? (
          <Text style={Fonts.textRegular}>
            {data ? data.errors[0].message : ''}
          </Text>
        ) : (
          <Text style={Fonts.textRegular}>
            {t('verifyEmail.firstOrgName', { name: data?.orgData[0].name })}
          </Text>
        )}
      </View>
      <View
        style={[
          Layout.row,
          Layout.rowHCenter,
          Gutters.smallHPadding,
          Gutters.largeVMargin,
        ]}
      >
        <Text style={[Layout.fill, Fonts.textCenter, Fonts.textSmall]}>
          {t('verifyEmail.labels.emailId')}
        </Text>
        <TextInput
          onChangeText={setEmailId}
          editable={!isLoading}
          maxLength={100}
          value={emailId}
          selectTextOnFocus
          style={[Layout.fill, Common.textInput]}
        />
      </View>
    </ScrollView>
  )
}

export default VerifyEmailContainer
