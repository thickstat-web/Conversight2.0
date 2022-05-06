import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, ButtonCustom } from '@/Components'
import { useTheme } from '@/Hooks'
import { ENTER_EMAIL_SCREEN } from '@/Constants/screens'
import { Colors } from '@/Theme/Variables'
import { Text, View } from 'react-native-ui-lib'

type LoginProps = {
  navigation: any
}

const LandingContainer = ({ navigation }: LoginProps) => {
  const { t } = useTranslation()
  const { Fonts, Gutters, Layout } = useTheme()

  const handleRedirect = () => {
    navigation.navigate(ENTER_EMAIL_SCREEN)
  }

  return (
    <ScrollView
      style={Layout.fill}
      contentContainerStyle={[
        Layout.fill,
        Layout.colCenter,
        Gutters.smallHPadding,
      ]}
    >
      <View style={[[Layout.colCenter, Gutters.smallHPadding]]}>
        <View marginT-30>
          <Brand />
        </View>
        <View flex bottom>
          <Text style={{ ...Fonts.textRegular, color: Colors.GREEN_DARK }}>
            Actionable Insights.
          </Text>
          <Text style={{ ...Fonts.textRegular, color: Colors.GREEN_DARK }}>
            Instantly. Anywhere.
          </Text>
        </View>
        <View flex bottom style={styles.btnBox}>
          <ButtonCustom
            action={handleRedirect}
            label="Login"
            labelColor={Colors.WHITE}
            color={Colors.GREEN_MAIN}
          />
          <ButtonCustom
            label="Request a Demo"
            labelColor={Colors.WHITE}
            color={Colors.GREEN_DARK}
          />
          <ButtonCustom
            action={() => {}}
            label="I'll Sign up later"
            labelColor={Colors.GREEN_LIGHTER}
            color="transparent"
          />
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  btnBox: {
    marginBottom: 30,
  },
})

export default LandingContainer
