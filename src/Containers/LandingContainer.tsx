import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, ButtonCustom } from '@/Components'
import { useTheme } from '@/Hooks'
import { ENTER_EMAIL_SCREEN } from '@/Constants/screens'
import { Text, View } from 'react-native-ui-lib'

type LoginProps = {
  navigation: any
}

const LandingContainer = ({ navigation }: LoginProps) => {
  const { t } = useTranslation()
  const { Colors, Fonts, Gutters, Layout } = useTheme()

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
      <View>
        <View flex-5 center>
          <Brand />
        </View>
        <View flex-2 center>
          <Text style={[Fonts.textRegular, styles.tagLineStyle]}>
            Actionable Insights.
          </Text>
          <Text style={[Fonts.textRegular, styles.tagLineStyle]}>
            Instantly. Anywhere.
          </Text>
        </View>
        <View flex-3 bottom style={styles.btnBox}>
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
            labelColor={Colors.GREEN_MAIN}
            color="transparent"
          />
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  tagLineStyle: {
    lineHeight: 24,
  },
  btnBox: {
    marginBottom: 30,
  },
})

export default LandingContainer
