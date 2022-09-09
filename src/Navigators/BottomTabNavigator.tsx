import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/Hooks'
import {
  ChatContainer,
  InsightsContainer,
  MyDashboardsContainer,
} from '@/Containers'
import { Text, TouchableOpacity } from 'react-native-ui-lib'
import BurgerIcon from '@/Assets/Images/drawer/burger.svg'
import CustomTabNavigation from './CustomTabNavigator'

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
      tabBar={props => <CustomTabNavigation {...props} />}
      initialRouteName={t('bottomTabs.insights')}
      screenOptions={({ route }) => ({
        headerTitleStyle: { fontFamily: 'Montserrat-SemiBold' },
        headerLeft: () => <OpenDrawer />,
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
          headerTintColor: Colors.WHITE,
          headerStyle: {
            backgroundColor: Colors.GREEN_MAIN,
          },
          headerShadowVisible: true,
          headerTitleAlign: 'center',
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />
      {/* <Tab.Screen
        name={t('bottomTabs.chat')}
        component={ChatContainer}
        options={{
          headerTitleAlign: 'center',
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      /> */}
      <Tab.Screen
        name={t('bottomTabs.dashboard')}
        component={MyDashboardsContainer}
        options={{
          title: 'My Dashboards',
          headerTintColor: Colors.WHITE,
          headerStyle: {
            backgroundColor: Colors.GREEN_MAIN,
          },
          headerShadowVisible: true,
          headerTitleAlign: 'center',
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />
    </Tab.Navigator>
  )
}

export default BottomTabNavigator
