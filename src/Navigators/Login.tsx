import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '@/Hooks'
import {
  CHOOSE_ORGANIZATION,
  ENTER_EMAIL_SCREEN,
  LANDING_SCREEN,
  PASSWORD_SCREEN,
  MAIN_SCREEN,
  WALK_THROUGH,
  RECOVER_ENTER_EMAIL,
  RECOVER_ENTER_PASSWORD,
  RECOVER_COMPLETED,
} from '@/Constants/screens'
import LandingContainer from '@/Containers/LandingContainer'
import MainNavigator from './Main'
import {
  ChooseOrganizationContainer,
  EnterEmailContainer,
  PasswordContainer,
} from '@/Containers'
import WalkThrough from '@/Containers/WalkThrough'
import RecoverEnterEmail from '@/Containers/RecoverEnterEmail'
import RecoverEnterPassword from '@/Containers/RecoverEnterPassword'
import RecoverComplete from '@/Containers/RecoverComplete'

const Stack = createStackNavigator()

const LoginNavigator = () => {
  const { Colors, Fonts } = useTheme()
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: Colors.GRAY },
        headerTitleStyle: {
          ...Fonts.textRegularBold,
          fontSize: 20,
        },
      }}
    >
      <Stack.Screen
        name={LANDING_SCREEN}
        component={LandingContainer}
        options={{
          title: 'Welcome',
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
      <Stack.Screen
        name={MAIN_SCREEN}
        component={MainNavigator}
        options={{
          headerShown: false,
          title: 'Home',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name={WALK_THROUGH}
        component={WalkThrough}
        options={{
          headerShown: false,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name={RECOVER_ENTER_EMAIL}
        component={RecoverEnterEmail}
        options={{
          title: 'Recover Credentials',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name={RECOVER_ENTER_PASSWORD}
        component={RecoverEnterPassword}
        options={{
          title: 'Recover Credentials',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name={RECOVER_COMPLETED}
        component={RecoverComplete}
        options={{
          title: 'Recover Credentials',
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  )
}

export default LoginNavigator
