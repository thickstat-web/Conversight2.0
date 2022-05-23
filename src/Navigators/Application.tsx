import React from 'react'
import { SafeAreaView, StatusBar } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import { StartupContainer } from '@/Containers'
import { useAuth, useTheme } from '@/Hooks'
import {
  LOGIN_NAVIGATOR,
  MAIN_SCREEN,
  STARTUP_SCREEN,
} from '@/Constants/screens'
import { navigationRef } from './utils'
import LoginNavigator from './Login'
import MainNavigator from './Main'

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
          {isSignedIn ? (
            <>
              <Stack.Screen
                name={STARTUP_SCREEN}
                component={StartupContainer}
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
            </>
          ) : (
            <>
              <Stack.Screen
                name={LOGIN_NAVIGATOR}
                component={LoginNavigator}
                options={{
                  animationEnabled: false,
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
