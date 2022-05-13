import React, { useEffect } from 'react'
import { View, Text } from 'react-native-ui-lib'
import LockIcon from '@/Assets/Images/lock.svg'
import { useTheme } from '@/Hooks'
import { TextInput } from 'react-native'
import PasswordSecuredIcon from '@/Assets/Images/iconsSVG/passwordHide.svg'
import PasswordVisibleIcon from '@/Assets/Images/iconsSVG/passwordShow.svg'
import PasswordSecuredIconError from '@/Assets/Images/iconsSVG/passwordHideError.svg'
import PasswordVisibleIconError from '@/Assets/Images/iconsSVG/passwordShowError.svg'
import CloseIcon from '@/Assets/Images/iconsSVG/close.svg'
import InputErrorIcon from '@/Assets/Images/iconsSVG/inputError.svg'
import { store } from '@/Store'
import { RECOVER_COMPLETED } from '@/Constants/screens'
interface Props {
  navigation: any
}

const RecoverEnterPassword = ({ navigation }: Props) => {
  const { Layout, Fonts, Colors, Common } = useTheme()
  const [password, setPassword] = React.useState<string>('')
  const [rePassword, setRePassword] = React.useState<string>('')
  const [passSecured, setPassSecured] = React.useState<boolean>(true)
  const [error, setError] = React.useState<boolean>(false)

  const togglePasswordEye = () => setPassSecured(show => !show)

  const handleSubmit = () => {
    if (password.length && rePassword.length && password === rePassword) {
      // todo handle api call here
      // build an endpoint
      const { selectedOrg, email } = store.getState().authReducer
      console.log(selectedOrg, email)
      navigation.navigate(RECOVER_COMPLETED)
    }
  }

  const validate = () => {
    if (password !== rePassword) {
      setError(true)
    } else {
      setError(false)
    }
  }
  return (
    <View style={Layout.colCenter}>
      <LockIcon width={150} height={150} />
      <Text
        marginB-20
        style={{ ...Fonts.textRegularBold, color: Colors.GREEN_DARK }}
      >
        Enter your new password
      </Text>
      <View margin-5 centerV>
        <TextInput
          onSubmitEditing={handleSubmit}
          onChangeText={x => setPassword(x)}
          placeholder="Type new password"
          style={[
            Common.textInput,
            error && {
              borderColor: Colors.DARK_BLUE,
              color: Colors.DARK_BLUE,
            },
          ]}
          value={password}
          secureTextEntry={passSecured}
        />
        <View style={Common.inputIcon}>
          {error && (
            <InputErrorIcon style={[Common.inputIcon, { right: 25, top: 2 }]} />
          )}
          {error && !passSecured && (
            <PasswordSecuredIconError onPress={togglePasswordEye} />
          )}
          {error && passSecured && (
            <PasswordVisibleIconError onPress={togglePasswordEye} />
          )}
          {passSecured
            ? !error && <PasswordVisibleIcon onPress={togglePasswordEye} />
            : !error && <PasswordSecuredIcon onPress={togglePasswordEye} />}
        </View>
      </View>
      <View margin-5 centerV>
        <TextInput
          onSubmitEditing={handleSubmit}
          onBlur={validate}
          placeholder="Repeat password"
          onChangeText={x => setRePassword(x)}
          style={[
            Common.textInput,
            error && {
              borderColor: Colors.DARK_BLUE,
              color: Colors.DARK_BLUE,
            },
          ]}
          value={rePassword}
          secureTextEntry={passSecured}
        />
        <View style={Common.inputIcon}>
          {error && (
            <InputErrorIcon style={[Common.inputIcon, { right: 25, top: 2 }]} />
          )}
          {error && !passSecured && (
            <PasswordSecuredIconError onPress={togglePasswordEye} />
          )}
          {error && passSecured && (
            <PasswordVisibleIconError onPress={togglePasswordEye} />
          )}
          {passSecured
            ? !error && <PasswordVisibleIcon onPress={togglePasswordEye} />
            : !error && <PasswordSecuredIcon onPress={togglePasswordEye} />}
        </View>
      </View>
    </View>
  )
}

export default RecoverEnterPassword
