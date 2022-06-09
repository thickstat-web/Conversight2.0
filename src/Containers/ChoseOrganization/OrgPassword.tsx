import React, { useEffect, useState } from 'react'
import { StyleSheet, TextInput } from 'react-native'
import { TouchableOpacity, View, Text } from 'react-native-ui-lib'
import { useTranslation } from 'react-i18next'
import { useTheme, useAppDispatch, useAppSelector } from '@/Hooks'
import { Brand, Button, ButtonCustom } from '@/Components'
import { SignInRequestData } from '@/Types/SignInRequest'
import { useSignInMutation } from '@/Services/modules/auth'
import { selectPassword, selectSignInEmail, selectSignInOrg, setAuthData, setPassword } from '@/Store/Auth'
import { navigateAndSimpleReset } from '@/Navigators/utils'
import {
  RECOVER_ENTER_EMAIL,
  WALK_THROUGH,
  DRAWER_NAVIGATOR,
} from '@/Constants/screens'
import PasswordSecuredIcon from '@/Assets/Images/iconsSVG/passwordHide.svg'
import PasswordVisibleIcon from '@/Assets/Images/iconsSVG/passwordShow.svg'
import PasswordSecuredIconError from '@/Assets/Images/iconsSVG/passwordHideError.svg'
import PasswordVisibleIconError from '@/Assets/Images/iconsSVG/passwordShowError.svg'
import CloseIcon from '@/Assets/Images/iconsSVG/close.svg'
import InputErrorIcon from '@/Assets/Images/iconsSVG/inputError.svg'

const OrgPassword = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslation()
  const { Colors, Common, Fonts } = useTheme()
  const password = useAppSelector(selectPassword);
  const [passSecured, setPassSecured] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const dispatch = useAppDispatch()
  const signInEmail = useAppSelector(selectSignInEmail)
  const signInOrg = useAppSelector(selectSignInOrg)

  const [signIn, { data: resp, isLoading, isSuccess }] = useSignInMutation()

  const togglePasswordEye = () => setPassSecured(show => !show)

  const handleRecover = () => navigation.navigate(RECOVER_ENTER_EMAIL)

  useEffect(() => {
    if (!password || !password.length) dispatch(setPassword('sakthi'))
  }, [])

  const handleSignIn = () => {
    if (signInEmail && password && signInOrg) {
      const authData: SignInRequestData = {
        email: signInEmail,
        password: password,
        deviceId: 'Web',
        deviceName: 'mobile',
        orgId: signInOrg?.orgId,
      }
      signIn(authData)
    }
  }

  useEffect(() => {
    if (isSuccess && resp && resp.success && resp.data) {
      dispatch(setAuthData(resp.data))
      const navigateTo = resp.data.isFirstTimeLogin
        ? WALK_THROUGH
        : DRAWER_NAVIGATOR
      navigateAndSimpleReset(navigateTo)
    } else if (isSuccess && !resp?.success) {
      setError(true)
      console.log(`[PasswordContainer] auth error: ${resp?.error}`)
    }
  }, [isSuccess, resp, dispatch])

  return (
    <View flex>

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
            placeholder='Password'
            onChangeText={x => dispatch(setPassword(x))}
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

            {(!error) &&
              (passSecured ? (
                <PasswordVisibleIcon onPress={togglePasswordEye} />
              ) : (
                <PasswordSecuredIcon onPress={togglePasswordEye} />
              ))
            }

          </View>
        </View>
        <View marginT-16 width={300}>
          <Button
            dark={true}
            block={true}
            label={t('common.buttons.login')}
            disabled={!password.length || !signInOrg?.name}
            onPress={handleSignIn}
            loading={isLoading}
          />
        </View>
        <ButtonCustom
          action={handleRecover}
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

export default OrgPassword
