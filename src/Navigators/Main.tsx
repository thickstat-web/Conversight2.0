import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/Hooks'
import {
  ChatContainer,
  InsightsContainer,
  DashboardContainer,
} from '@/Containers'
import { Text, View } from 'react-native-ui-lib'

const Tab = createBottomTabNavigator()

// @refresh reset
const MainNavigator = () => {
  const { t } = useTranslation()
  const { Colors, Fonts } = useTheme()
  return (
    <Tab.Navigator
      initialRouteName={t('bottomTabs.chat')}
      screenOptions={({ route }) => ({
        tabBarStyle: {
          borderTopEndRadius: 20,
          borderTopStartRadius: 20,
          borderColor: Colors.WHITE,
          borderWidth: 10,
          backgroundColor: 'transparent',
        },
        tabBarLabel: ({ focused, color }) => (
          <Text
            style={[
              Fonts.text15Bold,
              { color: focused ? Colors.GREEN_MAIN : Colors.GREEN_DARK },
            ]}
          >
            {route.name}
          </Text>
        ),
      })}
    >
      <Tab.Screen
        name={t('bottomTabs.insights')}
        component={InsightsContainer}
        options={{
          headerShown: false,
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />
      <Tab.Screen
        name={t('bottomTabs.chat')}
        component={ChatContainer}
        options={{
          headerShown: false,
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />
      <Tab.Screen
        name={t('bottomTabs.dashboard')}
        component={DashboardContainer}
        options={{
          headerShown: false,
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />
    </Tab.Navigator>
  )
}

export default MainNavigator
