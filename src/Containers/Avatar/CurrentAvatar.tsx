import { View, Text } from 'react-native-ui-lib'
import React from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { Avatar } from 'react-native-ui-lib'
import ImagePicker from 'react-native-image-crop-picker'
import { Button, ButtonCustom } from '@/Components'
import { useTheme } from '@/Hooks'
import SuccessIcon from '@/Assets/Images/iconsSVG/image-uploaded.svg'
import { NavigationProp, ParamListBase } from '@react-navigation/native'

interface Props {
  navigation: NavigationProp<ParamListBase>
}

const CurrentAvatar = ({ navigation }: Props) => {
  const { Colors, Layout, Fonts } = useTheme()
  const [testImage, setTestImage] = React.useState<any>('')
  const [isChanged, setIsChanged] = React.useState(false)

  const handlePick = () => {
    ImagePicker.openPicker({
      cropperCircleOverlay: true,
      multiple: false,
      cropping: true,
      mediaType: 'photo',
    })
      .then(image => {
        console.log(image.path)
        setTestImage(image.path)
        setIsChanged(true)
      })
      .catch(e => console.log(e))
  }

  return (
    <ScrollView contentContainerStyle={[Layout.center, { flex: 1 }]}>
      <View flex-10 center>
        <View>
          <Avatar size={150} source={{ uri: testImage }} />
          {isChanged && (
            <SuccessIcon
              style={{ position: 'absolute', bottom: -25, right: -25 }}
            />
          )}
        </View>
        <Text
          marginT-25
          center
          color={Colors.GREEN_DARK}
          style={[Fonts.textRegularBold, { fontSize: 24, lineHeight: 30 }]}
        >
          {isChanged
            ? 'Your profile avatar \n has been set'
            : 'Your current profile \n Avatar'}
        </Text>
      </View>
      <View marginB-20 flex-1 width={300} bottom>
        {isChanged ? (
          <Button onPress={() => navigation.goBack()} block dark label="Done" />
        ) : (
          <Button onPress={handlePick} block dark label="Edit" />
        )}
      </View>
    </ScrollView>
  )
}

export default CurrentAvatar
