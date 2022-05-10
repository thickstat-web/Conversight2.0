import React, { useEffect, useState } from 'react'
import { StyleSheet, TextInput } from 'react-native'
import { TouchableOpacity, View, Text } from 'react-native-ui-lib'
import { useTranslation } from 'react-i18next'
import { useTheme, useAppDispatch, useAppSelector } from '@/Hooks'
import { Brand, Button, ButtonCustom } from '@/Components'
import { SignInRequestData } from '@/Types/SignInRequest'
import { useSignInMutation } from '@/Services/modules/auth'
import { selectSignInEmail, selectSelectedOrg, setAuthData } from '@/Store/Auth'
import { navigateAndSimpleReset } from '@/Navigators/utils'
import { MAIN_SCREEN } from '@/Constants/screens'
import PasswordSecuredIcon from '@/Assets/Images/iconsSVG/passwordHide.svg'
import PasswordVisibleIcon from '@/Assets/Images/iconsSVG/passwordShow.svg'
import PasswordSecuredIconError from '@/Assets/Images/iconsSVG/passwordHideError.svg'
import PasswordVisibleIconError from '@/Assets/Images/iconsSVG/passwordShowError.svg'
import CloseIcon from '@/Assets/Images/iconsSVG/close.svg'
import InputErrorIcon from '@/Assets/Images/iconsSVG/inputError.svg'

const PasswordContainer = () => {
  const { t } = useTranslation()
  const { Gutters, Layout, Colors, Common, Fonts } = useTheme()
  // ToDo: Need to remove default password
  const [password, setPassword] = useState<string>('Login!23')
  const [passSecured, setPassSecured] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const dispatch = useAppDispatch()
  const signInEmail = useAppSelector(selectSignInEmail)
  const signInOrg = useAppSelector(selectSelectedOrg)

  const [signIn, { data, isLoading, isSuccess }] = useSignInMutation()

  const togglePasswordEye = () => setPassSecured(show => !show)

  const handleSignIn = () => {
    const authData: SignInRequestData = {
      email: signInEmail,
      password: password,
      deviceId: 'Web',
      deviceName: 'mobile',
      orgId: signInOrg.orgId,
    }
    signIn(authData)
  }

  useEffect(() => {
    if (isSuccess && data && data.success) {
      dispatch(setAuthData(data.data))
      // ToDo: Redirect to Main/HomeScreen (or Walk through screens)
      navigateAndSimpleReset(MAIN_SCREEN)
      console.log(`[PasswordContainer] auth data: ${JSON.stringify(data.data)}`)
    } else if (isSuccess && !data?.success) {
      console.log(`[PasswordContainer] auth error: ${data?.error}`)
    }
  }, [isSuccess, data, dispatch])

  return (
    <View flex>
      <View flex-4 center>
        <Brand width={'60%'} />
      </View>
      <View flex-6 centerH marginT-20>
        {error && (
          <TouchableOpacity
            style={[styles.hint, { backgroundColor: Colors.DARK_BLUE }]}
            onPress={() => setError(false)}
          >
            <Text style={[Fonts.regular]} color={Colors.WHITE}>
              Wrong Password
            </Text>
            <CloseIcon style={{ marginLeft: 20 }} />
          </TouchableOpacity>
        )}

        <View style={Common.inputBox}>
          <TextInput
            onChangeText={x => setPassword(x)}
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
              <InputErrorIcon
                style={[Common.inputIcon, { right: 25, top: 2 }]}
              />
            )}
            {error && passSecured && (
              <PasswordSecuredIconError onPress={togglePasswordEye} />
            )}
            {error && !passSecured && (
              <PasswordVisibleIconError onPress={togglePasswordEye} />
            )}
            {passSecured ? (
              <PasswordVisibleIcon onPress={togglePasswordEye} />
            ) : (
              <PasswordSecuredIcon onPress={togglePasswordEye} />
            )}
          </View>
        </View>
        <View marginT-16 width={300}>
          <Button
            dark={true}
            block={true}
            label={t('common.buttons.next')}
            disabled={!password.length}
            onPress={handleSignIn}
            loading={isLoading}
          />
        </View>
        <ButtonCustom
          action={() => {}}
          labelColor={Colors.GREEN_DARK}
          color="transparent"
          label="Recover Credentials?"
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

export default PasswordContainer
