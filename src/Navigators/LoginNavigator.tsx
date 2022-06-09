import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '@/Hooks'
import {
  CHOOSE_ORGANIZATION,
  ENTER_EMAIL_SCREEN,
  LANDING_SCREEN,
  DRAWER_NAVIGATOR,
  WALK_THROUGH,
  RECOVER_ENTER_EMAIL,
  RECOVER_ENTER_PASSWORD,
  RECOVER_COMPLETED,
  REQUEST_DEMO,
  DEMO_REQUESTED,
} from '@/Constants/screens'
import {
  LandingContainer,
  ChooseOrganizationContainer,
  EnterEmailContainer,
  WalkThroughContainer,
  RequestDemoContainer,
} from '@/Containers'
import RecoverEnterEmail from '@/Containers/RecoverEnterEmail'
import RecoverEnterPassword from '@/Containers/RecoverEnterPassword'
import RecoverComplete from '@/Containers/RecoverComplete'
import DrawerNavigator from './DrawerNavigator'
import BackArrow from '@/Assets/Images/iconsSVG/back.svg'
import DemoRequested from '@/Containers/DemoRequested'

const Stack = createStackNavigator()

const LoginNavigator = () => {
  const { Colors, Fonts } = useTheme()
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackImage: () => <BackArrow />,
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: Colors.GRAY },
        headerTitleStyle: { fontFamily: 'Montserrat-SemiBold' },
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
          headerBackTitleVisible: false,
          headerTintColor: Colors.DARK,
        }}
      />
      <Stack.Screen
        name={CHOOSE_ORGANIZATION}
        component={ChooseOrganizationContainer}
        options={{
          title: 'Login',
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name={WALK_THROUGH}
        component={WalkThroughContainer}
        options={{
          headerShown: false,
          title: '',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name={DRAWER_NAVIGATOR}
        component={DrawerNavigator}
        // component={MainNavigator}
        options={{
          headerShown: false,
          title: 'Home',
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

      <Stack.Screen
        name={REQUEST_DEMO}
        component={RequestDemoContainer}
        options={{
          title: 'Request a Demo',
          headerTitleAlign: 'center',
          headerTransparent: true,
          headerShown: true,
          animationEnabled: true,
        }}
      />

      <Stack.Screen
        name={DEMO_REQUESTED}
        component={DemoRequested}
        options={{
          headerTransparent: true,
          title: 'Request a Demo',
          headerShown: true,
          headerTitleAlign: "center",
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  )
}

export default LoginNavigator
