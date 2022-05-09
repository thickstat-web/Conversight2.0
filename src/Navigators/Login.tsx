import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import {
  CHOOSE_ORGANIZATION,
  ENTER_EMAIL_SCREEN,
  LANDING_SCREEN,
  PASSWORD_SCREEN,
} from '@/Constants/screens'
import LandingContainer from '@/Containers/LandingContainer'
import {
  ChooseOrganizationContainer,
  EnterEmailContainer,
  PasswordContainer,
} from '@/Containers'

const Stack = createStackNavigator()

const LoginNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={LANDING_SCREEN}
        component={LandingContainer}
        options={{
          title: 'Welcome',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name={ENTER_EMAIL_SCREEN}
        component={EnterEmailContainer}
        options={{
          title: 'Login',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name={CHOOSE_ORGANIZATION}
        component={ChooseOrganizationContainer}
        options={{
          title: 'Login',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name={PASSWORD_SCREEN}
        component={PasswordContainer}
        options={{
          title: 'Login',
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  )
}

export default LoginNavigator
