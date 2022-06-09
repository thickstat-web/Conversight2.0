import React, { useState } from 'react'
import { TextInput, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Button } from '@/Components'
import { useTheme, useAppDispatch } from '@/Hooks'
import { setSignInEmail } from '@/Store/Auth'
import { useLazyVerifyEmailQuery } from '@/Services/modules/auth'
import { Text, View } from 'react-native-ui-lib'
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
  const dispatch = useAppDispatch()
  const [email, setEmail] = useState(DEFAULT_EMAIL)
  const [emailInvalid, setEmailInvalid] = useState<boolean>(false)
  const [emailUnknown, setEmailUnknown] = useState<boolean>(false)
  const [errorHintOpen, setErrorHintOpen] = useState<boolean>(false)

  const [verifyEmail, { data, isLoading, isFetching }] =
    useLazyVerifyEmailQuery()

  const setAndCheckEmail = (val: string) => {
    const isValid = validateEmail(val)
    setEmailInvalid(!isValid)
    setEmailUnknown(false)
    setErrorHintOpen(false)
    setEmail(val)
  }

  const handleVerifyEmail = async () => {
    const { success, data: orgData } = await verifyEmail(email).unwrap()
    if (success) {
      ///
      // const test = orgData?.slice(0, 1)
      ///
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
    emailInvalid || emailUnknown
      ? { borderColor: Colors.DARK_BLUE, color: Colors.DARK_BLUE }
      : {}

  const emailValidStyle =
    !emailInvalid || !emailUnknown
      ? { borderColor: Colors.GREEN_MAIN, color: Colors.GREEN_MAIN }
      : {}

  return (
    <View flex>
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
              <Text
                style={[Fonts.textRegular, { lineHeight: 20 }]}
                color={Colors.WHITE}
              >
                {data?.error}
              </Text>
              <CloseIcon style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          )}
          <View row centerV width={300}>
            <TextInput
              onChangeText={e => setAndCheckEmail(e)}
              value={email}
              style={{
                ...Common.textInput,
                ...emailValidStyle,
                ...errorStyle,
              }}
            />
            {emailInvalid || emailUnknown ? (
              <InputErrorIcon style={Common.inputIcon} />
            ) : (
              <EmailOkIcon style={Common.inputIcon} />
            )}
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
    </View>
  )
}

const styles = StyleSheet.create({
  hint: {
    fontFamily: 'Montserrat-Regular',
    padding: 13,
    width: 300,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
})

export default EnterEmailContainer
