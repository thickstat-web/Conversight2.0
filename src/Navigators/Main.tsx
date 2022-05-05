import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { EnterEmailContainer } from '@/Containers'
import LandingContainer from '@/Containers/LandingContainer'

const Tab = createBottomTabNavigator()

// @refresh reset
const MainNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Sign In"
        component={LandingContainer}
        options={{
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />
      <Tab.Screen
        name="Verify Email"
        component={EnterEmailContainer}
        options={{
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />
    </Tab.Navigator>
  )
}

export default MainNavigator
