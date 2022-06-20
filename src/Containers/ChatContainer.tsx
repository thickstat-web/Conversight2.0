import React, { useRef } from 'react'
import { StyleSheet, } from 'react-native'
import { View, Text } from 'react-native-ui-lib'
import { Brand, Button, LayoutNoInternet, } from '@/Components'
import AthenaChatContainer from './Chat/AthenaChatContainer'

const ChatContainer = () => {
  const chatRef = useRef<any>()

  const openChat = () => {
    if (chatRef && chatRef.current) {
      chatRef.current.open()
    }
  }

  return (
    <LayoutNoInternet>
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
        </View>
        <AthenaChatContainer ref={chatRef} />
      </View>
    </LayoutNoInternet>

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
