import React, { useState } from 'react'
import { View, ScrollView, Dimensions, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/Hooks'

const { width } = Dimensions.get('window')

const ChatContainer = () => {
  const { t } = useTranslation()
  const { Fonts, Gutters, Layout } = useTheme()

  return (
    <View style={[Layout.fill, Layout.center]}>
      <Text>Chat Container</Text>
    </View>
  )
}

export default ChatContainer
