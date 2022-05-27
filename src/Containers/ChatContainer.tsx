import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, Platform } from 'react-native'
import { View, Text } from 'react-native-ui-lib'
import { useTranslation } from 'react-i18next'
import { useTheme, useAppDispatch, useAppSelector } from '@/Hooks'
import { Brand, Button, ButtonCustom } from '@/Components'
// import { useLazyLogoutQuery } from '@/Services/modules/auth'
// import { cleanupAuthData } from '@/Store/Auth'
import AthenaChatContainer, { RefProps } from './Chat/AthenaChatContainer'

const ChatContainer = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { Gutters, Layout, Colors, Common, Fonts } = useTheme()
  const chatRef = useRef<any>()

  // const [logout, { isLoading, isFetching }] = useLazyLogoutQuery()

  const openChat = () => {
    if (chatRef && chatRef.current) {
      chatRef.current.open()
    }
  }

  // const handleLogout = async () => {
  //   await logout()
  //   dispatch(cleanupAuthData())
  // }

  return (
    <View flex>
      <View flex-4 center>
        <Brand width={'60%'} />
      </View>
      <View flex-6 centerH margin-20>
        <View flex center>
          <Text text60>Chat - In Progress</Text>
        </View>
        <View flex center>
          <Button label="Chat" onPress={openChat} />
        </View>
        {/* <View flex center>
          <Button
            label="Logout"
            loading={isLoading || isFetching}
            onPress={handleLogout}
          />
        </View> */}
      </View>
      <AthenaChatContainer ref={chatRef} />
    </View>
  )
}

const styles = StyleSheet.create({
  userMessageWrapper: {
    flex: 1,
    marginLeft: '10%',
    marginRight: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    borderBottomRightRadius: 0,
  },
  gcanvas: {
    flex: 1,
    width: '100%',
  },
})

export default ChatContainer
