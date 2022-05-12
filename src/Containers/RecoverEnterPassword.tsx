import React from 'react'
import { View, Text } from 'react-native-ui-lib'
import LockIcon from '@/Assets/Images/lock.svg'
import { useTheme } from '@/Hooks'
import { TextInput } from 'react-native'

interface Props {
  navigation: any
}

const RecoverEnterPassword = ({ navigation }: Props) => {
  const { Layout, Fonts, Colors, Common } = useTheme()
  const [password, setPassword] = React.useState<string>('')
  const [rePassword, setRePassword] = React.useState<string>('')
  const [error, setError] = React.useState<boolean>(false)

  return (
    <View style={Layout.colCenter}>
      <LockIcon />
      <Text
        marginB-20
        style={{ ...Fonts.textRegularBold, color: Colors.GREEN_DARK }}
      >
        Enter your new password
      </Text>
      <TextInput placeholder="" style={Common.textInput} />
    </View>
  )
}

export default RecoverEnterPassword
