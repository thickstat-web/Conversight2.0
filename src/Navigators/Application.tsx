import React from 'react'
import { SafeAreaView, StatusBar } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import { useAppDispatch, useAuth, useTheme } from '@/Hooks'
import { ReadFAQ, RecoverComplete, RecoverEnterEmail, RecoverEnterPassword, StartupContainer } from '@/Containers'
import { navigationRef } from './utils'
import {
  CHANGE_ORGANIZATION,
  CHANGE_ORGANIZATION_PASSWORD,
  DEMO_REQUESTED,
  DRAWER_NAVIGATOR,
  LOGIN_NAVIGATOR,
  READ_FAQ,
  RECOVER_COMPLETED,
  RECOVER_ENTER_EMAIL,
  RECOVER_ENTER_PASSWORD,
  REQUEST_DEMO,
  SETTINGS,
  STARTUP_SCREEN,
  WALK_THROUGH_AUTHORIZED,
  WT_INSIGHTS,
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
import SearchIcon from '@/Assets/Images/iconsSVG/search.svg'
import { TouchableOpacity } from 'react-native-ui-lib'
import { setModalSearchOpen } from '@/Store/Faq'
import InsightsWT from '@/Containers/WalkThrough/InsightsWT'
import DemoRequested from '@/Containers/DemoRequested'


const Stack = createStackNavigator()

// @refresh reset
const ApplicationNavigator = () => {
  const { isSignedIn } = useAuth()
  const { Colors, Layout, darkMode, NavigationTheme } = useTheme()
  const { colors } = NavigationTheme
  const dispatch = useAppDispatch()

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
            headerBackImage: () => <BackArrow />,
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
                  headerRight: () => <TouchableOpacity onPress={() => { dispatch(setModalSearchOpen(true)) }}>
                    < SearchIcon />
                  </TouchableOpacity>,
                  headerRightContainerStyle: { paddingRight: 15 },
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
                  headerRightContainerStyle: { paddingRight: 15 },
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
                  headerShown: false,
                  animationEnabled: true,
                }}
              />

              <Stack.Screen
                name={WT_INSIGHTS}
                component={InsightsWT}
                options={{
                  headerTransparent: true,
                  title: "",
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

              <Stack.Screen
                name={RECOVER_ENTER_EMAIL}
                component={RecoverEnterEmail}
                options={{
                  headerShown: true,
                  title: 'Recover Credentials',
                  headerTitleAlign: 'center',
                }}
              />
              <Stack.Screen
                name={RECOVER_ENTER_PASSWORD}
                component={RecoverEnterPassword}
                options={{
                  headerShown: true,
                  title: 'Recover Credentials',
                  headerTitleAlign: 'center',
                }}
              />
              <Stack.Screen
                name={RECOVER_COMPLETED}
                component={RecoverComplete}
                options={{
                  headerShown: true,
                  title: 'Recover Credentials',
                  headerTitleAlign: 'center',
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
