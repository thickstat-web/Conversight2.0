import React, { useState } from 'react'
import {
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Text, View } from 'react-native-ui-lib'
import { useHeaderHeight } from '@react-navigation/elements'
import { useTranslation } from 'react-i18next'
import { useLazyVerifyEmailQuery } from '@/Services/modules/auth'
import { setSignInEmail } from '@/Store/Auth'
import { useTheme, useAppDispatch } from '@/Hooks'
import { Brand, Button, LayoutNoInternet } from '@/Components'
import { Colors } from '@/Theme/Variables'
import { validateEmail } from '@/Utils/validations/string'
import EmailOkIcon from '@/Assets/Images/iconsSVG/emailOk.svg'
import InputErrorIcon from '@/Assets/Images/iconsSVG/inputError.svg'
import CloseIcon from '@/Assets/Images/iconsSVG/close.svg'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { CHOOSE_ORGANIZATION } from '@/Constants/screens'
import { setAllOrganizations } from '@/Store/Auth/index'
import { DEFAULT_EMAIL } from '@/Config'

interface Props {
  navigation: any
}

const EnterEmailContainer = ({ navigation }: Props) => {
  const { t } = useTranslation()
  const { Common, Gutters, Layout, Fonts } = useTheme()
  const headerHeight = useHeaderHeight()
  const dispatch = useAppDispatch()
  const [email, setEmail] = useState(DEFAULT_EMAIL)
  const [emailInvalid, setEmailInvalid] = useState<boolean>(false)
  const [emailUnknown, setEmailUnknown] = useState<boolean>(false)
  const [errorHintOpen, setErrorHintOpen] = useState<boolean>(false)

  const [verifyEmail, { data, isLoading, isFetching }] =
    useLazyVerifyEmailQuery()

  const setAndCheckEmail = (val: string) => {
    const emailTrimed = val.trim()
    const isValid = validateEmail(emailTrimed)
    setEmailInvalid(!isValid)
    setEmailUnknown(false)
    setErrorHintOpen(false)
    setEmail(emailTrimed)
  }

  const handleVerifyEmail = async () => {
    const { success, data: orgData } = await verifyEmail(email).unwrap()
    if (success) {
      setEmailUnknown(false)
      setErrorHintOpen(false)
      setEmailInvalid(false)
      dispatch(setSignInEmail(email))
      dispatch(setAllOrganizations(orgData))
      navigation.navigate(CHOOSE_ORGANIZATION)
    } else {
      setEmailUnknown(true)
      setErrorHintOpen(true)
      setEmailInvalid(true)
      dispatch(setSignInEmail(''))
      dispatch(setAllOrganizations([]))
    }
  }

  const errorStyle =
    (emailInvalid || emailUnknown) && email.length
      ? { borderColor: Colors.DARK_BLUE, color: Colors.DARK_BLUE }
      : {}

  const emailValidStyle =
    (!emailInvalid || !emailUnknown) && email.length
      ? { borderColor: Colors.GREEN_MAIN, color: Colors.GREEN_MAIN }
      : {}

  return (
    <LayoutNoInternet>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        keyboardVerticalOffset={headerHeight}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View flex-4 center>
          <Brand width={'60%'} />
        </View>
        <View flex-6 centerH>
          <View>
            {errorHintOpen && data?.error && (
              <TouchableOpacity
                style={{ ...styles.hint, backgroundColor: Colors.DARK_BLUE }}
                onPress={() => setErrorHintOpen(false)}
              >
                <Text style={[Fonts.text15, { flex: 1 }]} color={Colors.WHITE}>
                  {/* Email doesn't exist in the database. */}
                  {data?.error}
                </Text>
                <CloseIcon style={{ marginLeft: 10 }} />
              </TouchableOpacity>
            )}
            <View row centerV width={300}>
              <TextInput
                onChangeText={e => setAndCheckEmail(e)}
                value={email}
                placeholder="Type your email"
                placeholderTextColor={Colors.GREEN_DARK}
                style={{
                  ...Common.textInput,
                  ...emailValidStyle,
                  ...errorStyle,
                }}
              />
              {(emailInvalid || emailUnknown) && email.length
                ? email.length > 0 && (
                    <InputErrorIcon style={Common.inputIcon} />
                  )
                : email.length > 0 && <EmailOkIcon style={Common.inputIcon} />}
            </View>
            <View marginT-16 width={300}>
              <Button
                block={true}
                dark={true}
                disabled={emailInvalid || emailUnknown}
                loading={isLoading || isFetching}
                label={t('enterEmail.buttons.next')}
                onPress={handleVerifyEmail}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LayoutNoInternet>
  )
}

const styles = StyleSheet.create({
  hint: {
    fontFamily: 'Montserrat-Regular',
    padding: 13,
    marginBottom: 6,
    width: 300,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
})

export default EnterEmailContainer
