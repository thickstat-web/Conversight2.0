import React, { useEffect, useState } from 'react'
import { StyleSheet, TextInput } from 'react-native'
import { TouchableOpacity, View, Text } from 'react-native-ui-lib'
import { useTranslation } from 'react-i18next'
import { useTheme, useAppDispatch, useAppSelector } from '@/Hooks'
import { Brand, LayoutNoInternet } from '@/Components'
import { useSignInMutation } from '@/Services/modules/auth'
import { selectSignInEmail, selectSignInOrg, setAuthData } from '@/Store/Auth'
import CloseIcon from '@/Assets/Images/iconsSVG/close.svg'
import Tooltip from '@/Components/Tooltip'

const InsightsContainer = () => {
  const { t } = useTranslation()
  const { Gutters, Layout, Colors, Common, Fonts } = useTheme()
  const dispatch = useAppDispatch()
  const signInEmail = useAppSelector(selectSignInEmail)

  const [signIn, { data, isLoading, isSuccess }] = useSignInMutation()

  useEffect(() => {
    if (isSuccess && data && data.success) {
      dispatch(setAuthData(data.data))
      console.log(`[PasswordContainer] auth data: ${JSON.stringify(data.data)}`)
    } else if (isSuccess && !data?.success) {
      console.log(`[PasswordContainer] auth error: ${data?.error}`)
    }
  }, [isSuccess, data, dispatch])

  return (
    <LayoutNoInternet>
      <View flex>
        <View flex-4 center>
          <Brand width={'60%'} />
        </View>
        <View flex-6 centerH margin-20>
          <View flex center>
            <Text text60>Insights - In Progress</Text>
            <Tooltip currentIndex={1} total={3} title="Ask Athena"
              text="Many devices with high speed for yesterday?"
              btnText="OK, got ya'"
            />
          </View>
        </View>
      </View>
    </LayoutNoInternet>

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

export default InsightsContainer
