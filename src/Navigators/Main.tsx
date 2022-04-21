import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { VerifyEmailContainer } from '@/Containers'
import LoginContainer from '@/Containers/LoginContainer'

const Tab = createBottomTabNavigator()

// @refresh reset
const MainNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Sign In"
        component={LoginContainer}
        options={{
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />
      <Tab.Screen
        name="Verify Email"
        component={VerifyEmailContainer}
        options={{
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />
    </Tab.Navigator>
  )
}

export default MainNavigator
