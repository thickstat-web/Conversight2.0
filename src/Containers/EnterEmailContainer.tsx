import React, { FC, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Touchable,
} from 'react-native'
import { Brand, ButtonCustom } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyVerifyEmailQuery } from '@/Services/modules/auth'
import { Text, View } from 'react-native-ui-lib'
import { Colors } from '@/Theme/Variables'
import { validateEmail } from '@/Utils/validations/string'
import { store } from '@/Store'
import EmailOkIcon from '@/Assets/Images/iconsSVG/emailOk.svg'
import InputErrorIcon from '@/Assets/Images/iconsSVG/inputError.svg'
import CloseIcon from '@/Assets/Images/iconsSVG/close.svg'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { CHOOSE_ORGANIZATION } from '@/Constants/screens'
import { setAllOrganizations } from '@/Store/Auth/index'

interface Props {
  navigation: any
}

const EnterEmailContainer = ({ navigation }: Props) => {
  const { Common, Layout, Fonts } = useTheme()

  const [email, setEmail] = useState('athena@conversight.ai')
  const [emailInvalid, setEmailInvalid] = useState<boolean>(false)
  const [emailUnknown, setEmailUnknown] = useState<boolean>(false)
  const [errorHintOpen, setErrorHintOpen] = useState<boolean>(false)

  const [verifyEmail, { isLoading, isFetching }] = useLazyVerifyEmailQuery()

  const setAndCheckEmail = (val: string) => {
    const isValid = validateEmail(val)
    setEmailInvalid(!isValid)
    setEmailUnknown(false)
    setErrorHintOpen(false)
    setEmail(val)
  }

  const handlePress = async () => {
    const { data } = await verifyEmail(email)
    const code = data?.code
    store.dispatch(setAllOrganizations([]))
    if (code === 200) {
      setEmailUnknown(false)
      setErrorHintOpen(false)
      setEmailInvalid(false)
      store.dispatch(setAllOrganizations(data?.orgData))
      navigation.navigate(CHOOSE_ORGANIZATION)
    } else {
      setEmailUnknown(true)
      setErrorHintOpen(true)
      setEmailInvalid(true)
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

  console.log(store.getState().authReducer)
  return (
    <View style={[[Layout.fill]]}>
      <View style={[[Layout.colCenter]]}>
        <Brand />
        {(isLoading || isFetching) && <ActivityIndicator />}
        {errorHintOpen && (
          <TouchableOpacity
            style={{ ...styles.hint, backgroundColor: Colors.DARK_BLUE }}
            onPress={() => setErrorHintOpen(false)}
          >
            <Text style={[Fonts.regular]} color="#fff">
              Email doesn't exist in the database.
            </Text>
            <CloseIcon style={{ marginLeft: 20 }} />
          </TouchableOpacity>
        )}
        <View style={Common.inputBox}>
          <View>
            <TextInput
              onChangeText={e => setAndCheckEmail(e)}
              value={email}
              style={{
                ...Common.textInput,
                ...emailValidStyle,
                ...errorStyle,
              }}
            />
          </View>
          {emailInvalid || emailUnknown ? (
            <InputErrorIcon style={Common.inputIcon} />
          ) : (
            <EmailOkIcon style={Common.inputIcon} />
          )}
        </View>

        <ButtonCustom
          action={handlePress}
          label="Next"
          color={Colors.GREEN_DARK}
        />
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
    alignItems: 'center',
  },
})

export default EnterEmailContainer
