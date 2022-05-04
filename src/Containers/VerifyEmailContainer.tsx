import React, { useState } from 'react'
import { View, Text, TextInput, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Button } from '@/Components'
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

  // useEffect(() => {
  //   verifyEmail(emailId)
  // }, [verifyEmail, emailId])

  return (
    <ScrollView
      style={Layout.fill}
      contentContainerStyle={[
        Layout.fill,
        Layout.colHCenter,
        Gutters.largeHMargin,
      ]}
    >
      <View style={[Layout.fill, Layout.rowCenter]}>
        <Brand />
      </View>
      <View style={[Layout.fill]}>
        {!(isLoading || isFetching) && (
          <View style={[Layout.colCenter]}>
            {!isSuccess ? (
              <Text style={Fonts.textNormal}>
                {data ? data.errors[0].message : ''}
              </Text>
            ) : (
              <Text style={Fonts.textNormal}>
                {'Email is valid!'}
                {/* {t('verifyEmail.orgName', {
                  name: data?.orgData[0].name,
                })} */}
              </Text>
            )}
          </View>
        )}

        <View style={Gutters.largeVMargin}>
          <Text style={Fonts.textNormal}>
            {t('verifyEmail.labels.emailId')}
          </Text>
          <TextInput
            onChangeText={setEmailId}
            editable={!isLoading}
            maxLength={100}
            value={emailId}
            selectTextOnFocus
            style={Common.textInput}
          />
        </View>

        <Button
          block={true}
          dark={true}
          loading={isLoading || isFetching}
          onPress={() => verifyEmail(emailId)}
        >
          {t('verifyEmail.buttons.verifyEmail')}
        </Button>
      </View>
    </ScrollView>
  )
}

export default VerifyEmailContainer
