import { View, Text } from 'react-native-ui-lib'
import React, { useEffect } from 'react'
import { useTheme, useAppDispatch } from '@/Hooks'
import LockIcon from '@/Assets/Images/lock.svg'
import { TextInput, Keyboard, ActivityIndicator } from 'react-native'
import { validateEmail } from '@/Utils/validations/string'
import EmailOkIcon from '@/Assets/Images/iconsSVG/emailOk.svg'
import InputErrorIcon from '@/Assets/Images/iconsSVG/inputError.svg'
import { useLazyVerifyEmailQuery } from '@/Services/modules/auth'
import { setSignInEmail } from '@/Store/Auth'
import { RECOVER_ENTER_PASSWORD } from '@/Constants/screens'

interface Props {
  navigation: any
}

const RecoverEnterEmail = ({ navigation }: Props) => {
  const { Layout, Fonts, Colors, Common } = useTheme()
  const dispatch = useAppDispatch()
  const [email, setEmail] = React.useState<string>('athena@conversight.ai')
  const [emailInvalid, setEmailInvalid] = React.useState<boolean>(false)
  const [emailUnknown, setEmailUnknown] = React.useState<boolean>(false)
  const [errorHintOpen, setErrorHintOpen] = React.useState<boolean>(false)

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        handleVerifyEmail()
      },
    )

    return () => keyboardDidHideListener.remove()
  }, [email])

  const [verifyEmail, { isLoading, isFetching }] = useLazyVerifyEmailQuery()

  const setAndCheckEmail = (val: string) => {
    const isValid = validateEmail(val)
    setEmailInvalid(!isValid)
    setEmailUnknown(false)
    setErrorHintOpen(false)
    setEmail(val)
  }

  async function handleVerifyEmail() {
    const { success } = await verifyEmail(email).unwrap()
    console.log(success)
    console.log(email)
    if (success) {
      setEmailUnknown(false)
      setErrorHintOpen(false)
      setEmailInvalid(false)
      dispatch(setSignInEmail(email))
      navigation.navigate(RECOVER_ENTER_PASSWORD)
    } else {
      setEmailUnknown(true)
      setErrorHintOpen(true)
      setEmailInvalid(true)
      dispatch(setSignInEmail(''))
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
    <View style={Layout.colCenter}>
      <LockIcon />
      <Text
        marginB-20
        style={{ ...Fonts.textRegularBold, color: Colors.GREEN_DARK }}
      >
        What's your Email?
      </Text>
      <View row centerV>
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
      {(isLoading || isFetching) && (
        <ActivityIndicator color={Colors.GREEN_MAIN} />
      )}
    </View>
  )
}

export default RecoverEnterEmail
