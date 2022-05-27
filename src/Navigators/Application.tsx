import React from 'react'
import { SafeAreaView, StatusBar } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import { useAuth, useTheme } from '@/Hooks'
import { ReadFAQ, StartupContainer } from '@/Containers'
import { navigationRef } from './utils'
import {
  CHANGE_ORGANIZATION,
  CHANGE_ORGANIZATION_PASSWORD,
  DRAWER_NAVIGATOR,
  LOGIN_NAVIGATOR,
  READ_FAQ,
  REQUEST_DEMO,
  SETTINGS,
  STARTUP_SCREEN,
  WALK_THROUGH_AUTHORIZED,
} from '@/Constants/screens'
import LoginNavigator from '@/Navigators/LoginNavigator'
import DrawerNavigator from '@/Navigators/DrawerNavigator'
import {
  ChangeOrganizationContainer,
  ChangeOrganizationPasswordContainer,
  RequestDemoContainer,
  SettingsContainer,
  WalkThroughAuthorizesContainer,
} from '@/Containers'
import BackArrow from '@/Assets/Images/iconsSVG/back.svg'
import BackArrowWhite from '@/Assets/Images/iconsSVG/back-white.svg'
import SaveIcon from '@/Assets/Images/iconsSVG/save.svg'

const Stack = createStackNavigator()

// @refresh reset
const ApplicationNavigator = () => {
  const { isSignedIn } = useAuth()
  const { Colors, Layout, darkMode, NavigationTheme } = useTheme()
  const { colors } = NavigationTheme

  return (
    <SafeAreaView style={[Layout.fill, { backgroundColor: colors.card }]}>
      <NavigationContainer theme={NavigationTheme} ref={navigationRef}>
        <StatusBar
          // barStyle={darkMode ? 'light-content' : 'dark-content'}
          barStyle={'light-content'}
          backgroundColor={Colors.GREEN_MAIN}
        />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {!isSignedIn ? (
            <Stack.Screen
              name={LOGIN_NAVIGATOR}
              component={LoginNavigator}
              options={{
                animationEnabled: false,
              }}
            />
          ) : (
            <>
              <Stack.Screen
                name={STARTUP_SCREEN}
                component={StartupContainer}
              />
              <Stack.Screen
                name={DRAWER_NAVIGATOR}
                component={DrawerNavigator}
                options={{
                  headerShown: false,
                  title: 'Home',
                  headerTitleAlign: 'center',
                }}
              />

              <Stack.Screen
                name={READ_FAQ}
                component={ReadFAQ}
                options={{
                  headerTitleStyle: { fontFamily: 'Montserrat-regular' },
                  title: 'Need Help?',
                  headerTitleAlign: 'center',
                  headerBackImage: () => <BackArrowWhite />,
                  headerTintColor: Colors.WHITE,
                  headerStyle: {
                    backgroundColor: Colors.GREEN_MAIN,
                  },
                  headerShown: true,
                  animationEnabled: true,
                }}
              />

              <Stack.Screen
                name={SETTINGS}
                component={SettingsContainer}
                options={{
                  headerTitleStyle: { fontFamily: 'Montserrat-regular' },
                  title: 'Profile & Settings',
                  headerTitleAlign: 'center',
                  headerRight: () => <SaveIcon />,
                  headerTintColor: Colors.WHITE,
                  headerBackImage: () => <BackArrowWhite />,
                  headerStyle: {
                    backgroundColor: Colors.GREEN_MAIN,
                  },
                  headerShown: true,
                }}
              />

              <Stack.Screen
                name={CHANGE_ORGANIZATION}
                component={ChangeOrganizationContainer}
                options={{
                  headerTitleStyle: { fontFamily: 'Montserrat-regular' },
                  title: 'Change Organization',
                  headerTitleAlign: 'center',
                  headerBackImage: () => <BackArrow />,
                  headerShown: true,
                }}
              />

              <Stack.Screen
                name={CHANGE_ORGANIZATION_PASSWORD}
                component={ChangeOrganizationPasswordContainer}
                options={{
                  headerTitleStyle: { fontFamily: 'Montserrat-regular' },
                  title: 'Login',
                  headerTitleAlign: 'center',
                  headerBackImage: () => <BackArrow />,
                  headerShown: true,
                }}
              />

              <Stack.Screen
                name={REQUEST_DEMO}
                component={RequestDemoContainer}
                options={{
                  headerBackImage: () => <BackArrow />,
                  title: 'Request a Demo',
                  headerTitleAlign: 'center',
                  headerTransparent: true,
                  headerShown: true,
                  animationEnabled: true,
                }}
              />

              <Stack.Screen
                name={WALK_THROUGH_AUTHORIZED}
                component={WalkThroughAuthorizesContainer}
                options={{
                  headerShown: true,
                  animationEnabled: true,
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  )
}

export default ApplicationNavigator
