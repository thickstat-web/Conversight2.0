import { TouchableOpacity, View, Text } from 'react-native-ui-lib'
import React, { useState } from 'react'
import { useTheme } from '@/Hooks'
import { Brand, ButtonCustom } from '@/Components'
import { StyleSheet, TextInput } from 'react-native'
import { useSignInMutation } from '@/Services/modules/auth'
import { ActivityIndicator } from 'react-native'
import PasswordSecuredIcon from '@/Assets/Images/iconsSVG/passwordHide.svg'
import PasswordVisibleIcon from '@/Assets/Images/iconsSVG/passwordShow.svg'
import PasswordSecuredIconError from '@/Assets/Images/iconsSVG/passwordHideError.svg'
import PasswordVisibleIconError from '@/Assets/Images/iconsSVG/passwordShowError.svg'
import CloseIcon from '@/Assets/Images/iconsSVG/close.svg'

import InputErrorIcon from '@/Assets/Images/iconsSVG/inputError.svg'

const PasswordContainer = () => {
  const { Gutters, Layout, Colors, Common, Fonts } = useTheme()
  const [password, setPassword] = useState<string>('')
  const [passSecured, setPassSecured] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(true)

  const [signIn, { data, isLoading }] = useSignInMutation()

  //   console.log(password)

  return (
    <View style={Layout.fill}>
      <View flex style={Layout.column}>
        <View style={[Layout.rowCenter, Gutters.largeTMargin]}>
          <Brand />
        </View>
        <View flex center>
          {isLoading && <ActivityIndicator />}

          {error && (
            <TouchableOpacity
              style={{ ...styles.hint, backgroundColor: Colors.DARK_BLUE }}
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
              style={
                error
                  ? {
                      ...Common.textInput,
                      borderColor: Colors.DARK_BLUE,
                      color: Colors.DARK_BLUE,
                    }
                  : Common.textInput
              }
              secureTextEntry={passSecured}
            />
            <View style={Common.inputIcon}>
              {error && (
                <InputErrorIcon
                  style={{ ...Common.inputIcon, right: 25, top: 2 }}
                />
              )}
              {passSecured ? (
                error ? (
                  <PasswordSecuredIconError
                    onPress={() => setPassSecured(x => !x)}
                  />
                ) : (
                  <PasswordSecuredIcon
                    onPress={() => setPassSecured(x => !x)}
                  />
                )
              ) : error ? (
                <PasswordVisibleIconError
                  onPress={() => setPassSecured(x => !x)}
                />
              ) : (
                <PasswordVisibleIcon onPress={() => setPassSecured(x => !x)} />
              )}
            </View>
          </View>
          <ButtonCustom label="Next" color={Colors.GREEN_DARK} />
          <ButtonCustom
            action={() => {}}
            labelColor={Colors.GREEN_DARK}
            color="transparent"
            label="Recover Credentials?"
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
    width: 300,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})

export default PasswordContainer
