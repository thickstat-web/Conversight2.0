import React, { useEffect, useState } from 'react'
import { StyleSheet, TextInput } from 'react-native'
import {
  TouchableOpacity,
  View,
  Text,
  Avatar,
  Button,
} from 'react-native-ui-lib'
import { useTranslation } from 'react-i18next'
import { useTheme, useAppDispatch, useAppSelector } from '@/Hooks'
import { Button as ButtonLoading } from '@/Components'
import { SignInRequestData } from '@/Types/SignInRequest'
import { useSignInMutation } from '@/Services/modules/auth'
import {
  selectSignInEmail,
  setAuthData,
  selectTempOrg,
  setSelectedOrg,
  selectAuthData,
} from '@/Store/Auth'
import { navigateAndSimpleReset } from '@/Navigators/utils'
import {
  DRAWER_NAVIGATOR,
  RECOVER_ENTER_EMAIL,
  WALK_THROUGH,
} from '@/Constants/screens'
import PasswordSecuredIcon from '@/Assets/Images/iconsSVG/passwordHide.svg'
import PasswordVisibleIcon from '@/Assets/Images/iconsSVG/passwordShow.svg'
import PasswordSecuredIconError from '@/Assets/Images/iconsSVG/passwordHideError.svg'
import PasswordVisibleIconError from '@/Assets/Images/iconsSVG/passwordShowError.svg'
import CloseIcon from '@/Assets/Images/iconsSVG/close.svg'
import InputErrorIcon from '@/Assets/Images/iconsSVG/inputError.svg'
import DownArrow from '@/Assets/Images/drawer/down-arrow.svg'
import { DEFAULT_PASSWORD } from '@/Config'

interface Props {
  navigation: any
}

const ChangeOrganizationPasswordContainer = ({ navigation }: Props) => {
  const { t } = useTranslation()
  const { Colors, Common, Fonts, Layout } = useTheme()
  const [password, setPassword] = useState<string>(DEFAULT_PASSWORD)
  const [passSecured, setPassSecured] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const dispatch = useAppDispatch()
  const signInEmail = useAppSelector(selectSignInEmail)
  const orgToBeChanged = useAppSelector(selectTempOrg)
  const authData = useAppSelector(selectAuthData)

  const [signIn, { data, isLoading, isSuccess }] = useSignInMutation()

  const togglePasswordEye = () => setPassSecured(show => !show)

  const handleRecover = () => navigation.navigate(RECOVER_ENTER_EMAIL)

  const handleSignIn = () => {
    if (password.length) {
      const signInReqData: SignInRequestData = {
        email: signInEmail.trim(),
        password: password.trim(),
        deviceId: 'Web',
        deviceName: 'mobile',
        orgId: orgToBeChanged.orgId,
      }
      signIn(signInReqData)
    }
  }

  useEffect(() => {
    if (isSuccess && data && data.success) {
      dispatch(setAuthData(data.data))
      dispatch(setSelectedOrg(orgToBeChanged))
      if (data.data && data.data.isFirstTimeLogin) {
        navigation.navigate(WALK_THROUGH)
      } else {
        navigation.navigate(DRAWER_NAVIGATOR)
      }

      console.log(
        `[ChangeOrganizationPasswordContainer] auth data: ${JSON.stringify(
          data.data,
        )}`,
      )
    } else if (isSuccess && !data?.success) {
      setError(true)
      console.log(
        `[ChangeOrganizationPasswordContainer] auth error: ${data?.error}`,
      )
    }
  }, [isSuccess, data, dispatch, navigation])

  return (
    <View flex>
      <View flex-4 center>
        <Avatar size={100} />
        <Text
          marginT-20
          style={{ ...Fonts.text20Bold, color: Colors.GREEN_DARK }}
        >
          {authData?.displayName}
        </Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text color={Colors.GREEN_MAIN}>Login to {orgToBeChanged.name}</Text>
          <DownArrow style={{ marginLeft: 5 }} />
        </View>
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
            placeholder="Password"
            placeholderTextColor={Colors.GREEN_DARK}
            style={[
              Common.textInput,
              error && {
                borderColor: Colors.DARK_BLUE,
                color: Colors.DARK_BLUE,
              },
            ]}
            value={password}
            secureTextEntry={passSecured}
            onSubmitEditing={handleSignIn}
          />
          <View style={Common.inputIcon}>
            {error && (
              <InputErrorIcon
                style={[Common.inputIcon, { right: 25, top: 2 }]}
              />
            )}
            {error && passSecured && (
              <PasswordVisibleIconError onPress={togglePasswordEye} />
            )}
            {error && !passSecured && (
              <PasswordSecuredIconError onPress={togglePasswordEye} />
            )}
            {passSecured
              ? !error && <PasswordVisibleIcon onPress={togglePasswordEye} />
              : !error && <PasswordSecuredIcon onPress={togglePasswordEye} />}
          </View>
        </View>
        <View marginT-16 width={300}>
          <ButtonLoading
            dark={true}
            block={true}
            label={t('common.buttons.next')}
            disabled={!password.length}
            onPress={handleSignIn}
            loading={isLoading}
          />
        </View>
        <View
          style={[Layout.row, { justifyContent: 'space-between', width: 300 }]}
        >
          <Button
            labelStyle={{ fontWeight: '700' }}
            color={Colors.GREEN_DARK}
            style={styles.transBtn}
            onPress={handleRecover}
            label="Recover Credentials?"
          />
          <Button
            labelStyle={{ fontWeight: '700' }}
            color={Colors.GREEN_DARK}
            style={styles.transBtn}
            onPress={() => setPassword('')}
            label="Reset"
          />
        </View>
      </View>
    </View>
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
    alignItems: 'center',
  },
  transBtn: {
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    minWidth: 20,
  },
})

export default ChangeOrganizationPasswordContainer
