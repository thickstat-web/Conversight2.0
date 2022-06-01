import { View, Text } from 'react-native-ui-lib'
import React from 'react'
import { useTheme, useAppDispatch } from '@/Hooks'
import { lockOk, lockError } from '@/Components/Images'
import {
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image
} from 'react-native'
import { validateEmail } from '@/Utils/validations/string'
import EmailOkIcon from '@/Assets/Images/iconsSVG/emailOk.svg'
import InputErrorIcon from '@/Assets/Images/iconsSVG/inputError.svg'
import CloseIcon from '@/Assets/Images/iconsSVG/close.svg'
import { useLazyVerifyEmailQuery } from '@/Services/modules/auth'
import { setSignInEmail } from '@/Store/Auth'
import { RECOVER_ENTER_PASSWORD } from '@/Constants/screens'

interface Props {
  navigation: any
}

const RecoverEnterEmail = ({ navigation }: Props) => {
  const { Layout, Fonts, Colors, Common } = useTheme()
  const dispatch = useAppDispatch()
  const [email, setEmail] = React.useState<string>('sakthivel.murugasamy@conversight.ai')
  const [emailInvalid, setEmailInvalid] = React.useState<boolean>(false)
  const [emailUnknown, setEmailUnknown] = React.useState<boolean>(false)
  const [errorHintOpen, setErrorHintOpen] = React.useState<boolean>(false)

  const [verifyEmail, { data, isLoading, isFetching }] =
    useLazyVerifyEmailQuery()

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
      {emailInvalid || emailUnknown
        ? <Image source={lockError} style={styles.image} />
        : <Image source={lockOk} style={styles.image} />
      }



      <Text
        marginB-20
        style={{ ...Fonts.textRegularBold, color: Colors.GREEN_DARK }}
      >
        What's your Email?
      </Text>
      {errorHintOpen && data?.error && (
        <TouchableOpacity
          style={{ ...styles.hint, backgroundColor: Colors.DARK_BLUE }}
          onPress={() => setErrorHintOpen(false)}
        >
          <Text
            style={[Fonts.textRegular, { lineHeight: 20, color: Colors.WHITE }]}
          >
            {data?.error}
          </Text>
          <CloseIcon style={{ marginLeft: 10 }} />
        </TouchableOpacity>
      )}
      <View row centerV>
        <TextInput
          onChangeText={e => setAndCheckEmail(e)}
          value={email}
          onSubmitEditing={() => handleVerifyEmail()}
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

const styles = StyleSheet.create({
  hint: {
    fontFamily: 'Montserrat-Regular',
    padding: 13,
    width: 300,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  image: {
    width: 150,
    height: 150,
  }
})
export default RecoverEnterEmail
