import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/Hooks'
import {
  ChatContainer,
  InsightsContainer,
  DashboardContainer,
} from '@/Containers'
import { Button, Text, TouchableOpacity, View } from 'react-native-ui-lib'
import BurgerIcon from '@/Assets/Images/drawer/burger.svg'

const Tab = createBottomTabNavigator()

interface Props {
  navigation: any
}

// @refresh reset
const BottomTabNavigator = ({ navigation }: Props) => {
  const { t } = useTranslation()
  const { Colors, Fonts } = useTheme()

  const OpenDrawer = () => (
    <TouchableOpacity onPress={() => navigation.openDrawer()} padding-15>
      <BurgerIcon />
    </TouchableOpacity>
  )

  return (
    <Tab.Navigator
      initialRouteName={t('bottomTabs.chat')}
      screenOptions={({ route }) => ({
        tabBarStyle: {
          borderTopEndRadius: 20,
          borderTopStartRadius: 20,
          borderColor: Colors.WHITE,
          borderWidth: 10,
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
          headerLeft: () => <OpenDrawer />,
          headerTitleAlign: 'center',
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />
      <Tab.Screen
        name={t('bottomTabs.chat')}
        component={ChatContainer}
        options={{
          headerLeft: () => <OpenDrawer />,
          headerTitleAlign: 'center',
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />
      <Tab.Screen
        name={t('bottomTabs.dashboard')}
        component={DashboardContainer}
        options={{
          headerLeft: () => <OpenDrawer />,
          headerTitleAlign: 'center',
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />
    </Tab.Navigator>
  )
}

export default BottomTabNavigator
