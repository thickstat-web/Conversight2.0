import { View, Text } from 'react-native-ui-lib'
import React from 'react'
import { useTheme } from '@/Hooks'
import { ButtonCustom } from '@/Components'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native-gesture-handler'

interface Props {
  navigation: any
}

const InsightsWT = ({ navigation }: Props) => {
  const { Layout, Fonts, Colors } = useTheme()
  const { t } = useTranslation()
  return (


    <ScrollView contentContainerStyle={[Layout.colCenter, { flex: 1, marginVertical: 20 }]}>
      <View flex>

      </View>
      <View paddingH-20 style={[Layout.colCenter]}>
        <Text style={[Fonts.text20Bold, { color: Colors.GREEN_DARK, marginBottom: 20 }]}>Insights</Text>
        <Text center style={[Fonts.textSmall]}>
          Best-in-class businesses combine
          data from their ERP
          and other systems into
          customized dashboards to measure and monitor.
          Give your teams the tools to fact-find,
          report and track performance to save time and money,
          grow revenue and be a stronger workplace.
        </Text>
        <ButtonCustom color={Colors.GREEN_DARK} label="Skip" action={() => navigation.navigate(t('bottomTabs.insights'))} />
      </View>

    </ScrollView>
  )
}

export default InsightsWT