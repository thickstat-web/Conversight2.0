import React from 'react'
import { StatusBar } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import { useAppDispatch, useAuth, useTheme } from '@/Hooks'
import {
  AvatarChanged,
  CurrentAvatar,
  DataExplorerContainer,
  WebExplorerContainer,
  ReadFAQ,
  RecoverComplete,
  RecoverEnterEmail,
  RecoverEnterPassword,
  StartupContainer,
} from '@/Containers'
// import { default as ChatFAQ } from '@/Containers/Chat/FAQ'
import { default as AthenaChatContainer } from '@/Containers/Chat/AthenaChatContainer'
import { navigationRef } from './utils'
import {
  AVATAR_CHANGED,
  CHANGE_AVATAR,
  CHANGE_ORGANIZATION,
  CHANGE_ORGANIZATION_PASSWORD,
  CHAT_FAQ,
  ATHENA_CHAT_SCREEN,
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
  DATA_EXPLORER,
  DASHBOARD_SCREEN,
  WEB_EXPLORER,
  LAUNCHPAD_SCREEN,
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
import DashboardContainer from '@/Containers/DashboardContainer'
import LaunchpadContainer from '@/Containers/LaunchpadContainer'

const Stack = createStackNavigator()

const renderWhiteBackArrow = () => <BackArrowWhite />
const renderBackArrow = () => <BackArrow />
const renderSaveIcon = () => <SaveIcon />
const SearchButton = () => {
  const dispatch = useAppDispatch()
  return (
    <TouchableOpacity
      onPress={() => {
        dispatch(setModalSearchOpen(true))
      }}
    >
      <SearchIcon />
    </TouchableOpacity>
  )
}

// @refresh reset
const ApplicationNavigator = () => {
  const { isSignedIn } = useAuth()
  const { Colors, Layout, darkMode, NavigationTheme } = useTheme()

  return (
    <>
      <StatusBar
        barStyle={isSignedIn ? 'light-content' : 'dark-content'}
        backgroundColor={isSignedIn ? Colors.GREEN_MAIN : 'transparent'}
      />
      <SafeAreaProvider
        style={[
          {
            flex: 1,
            backgroundColor: isSignedIn ? Colors.GREEN_MAIN : Colors.GRAY,
          },
        ]}
      >
        <NavigationContainer theme={NavigationTheme} ref={navigationRef}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              headerTitleStyle: { fontFamily: 'Montserrat-SemiBold' },
              headerBackImage: renderBackArrow,
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
                    headerTitleAlign: 'center',
                    // headerBackImage: renderWhiteBackArrow,
                    // headerTintColor: Colors.WHITE,
                    // headerStyle: {
                    //   backgroundColor: Colors.GREEN_MAIN,
                    // },
                    // headerShown: true,
                  }}
                />
                <Stack.Screen
                  name={ATHENA_CHAT_SCREEN}
                  component={AthenaChatContainer}
                  options={{
                    // headerRight: SearchButton,
                    headerRightContainerStyle: { paddingRight: 15 },
                    title: 'Ask Athena',
                    headerTitleAlign: 'center',
                    headerBackImage: renderWhiteBackArrow,
                    headerTintColor: Colors.WHITE,
                    headerStyle: {
                      backgroundColor: Colors.GREEN_MAIN,
                    },
                    headerShown: true,
                    headerBackTitleVisible: false,
                    animationEnabled: true,
                  }}
                />
                <Stack.Screen
                  name={DATA_EXPLORER}
                  component={DataExplorerContainer}
                  options={{
                    headerRightContainerStyle: { paddingRight: 15 },
                    title: 'Explorer',
                    headerTitleAlign: 'center',
                    headerTintColor: Colors.WHITE,
                    headerStyle: {
                      backgroundColor: Colors.GREEN_MAIN,
                    },
                    headerBackImage: renderWhiteBackArrow,
                    headerShown: true,
                    headerShadowVisible: false,
                    headerBackTitleVisible: false,
                    animationEnabled: true,
                  }}
                />
                <Stack.Screen
                  name={WEB_EXPLORER}
                  component={WebExplorerContainer}
                  options={{
                    headerRightContainerStyle: { paddingRight: 15 },
                    title: 'Data App Explorer',
                    headerTitleAlign: 'center',
                    headerTintColor: Colors.WHITE,
                    headerStyle: {
                      backgroundColor: Colors.GREEN_MAIN,
                    },
                    headerBackImage: renderWhiteBackArrow,
                    headerShown: true,
                    headerBackTitleVisible: false,
                    animationEnabled: true,
                  }}
                />
                <Stack.Screen
                  name={DASHBOARD_SCREEN}
                  component={DashboardContainer}
                  options={{
                    headerRightContainerStyle: { paddingRight: 15 },
                    title: 'Dashboard',
                    headerTitleAlign: 'center',
                    headerTintColor: Colors.WHITE,
                    headerStyle: {
                      backgroundColor: Colors.GREEN_MAIN,
                    },
                    headerShown: true,
                    headerBackImage: renderWhiteBackArrow,
                    headerBackTitleVisible: false,
                    animationEnabled: true,
                  }}
                />
                <Stack.Screen
                  name={READ_FAQ}
                  component={ReadFAQ}
                  options={{
                    headerRight: SearchButton,
                    headerRightContainerStyle: { paddingRight: 15 },
                    title: 'Need Help?',
                    headerTitleAlign: 'center',
                    headerBackImage: renderWhiteBackArrow,
                    headerTintColor: Colors.WHITE,
                    headerStyle: {
                      backgroundColor: Colors.GREEN_MAIN,
                    },
                    headerShown: true,
                    headerBackTitleVisible: false,
                    animationEnabled: true,
                  }}
                />

                <Stack.Screen
                  name={SETTINGS}
                  component={SettingsContainer}
                  options={{
                    title: 'Profile & Settings',
                    headerBackTitleVisible: false,
                    headerTitleAlign: 'center',
                    // headerRight: renderSaveIcon,
                    headerRightContainerStyle: { paddingRight: 15 },
                    headerTintColor: Colors.WHITE,
                    headerBackImage: renderWhiteBackArrow,
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
                    title: 'Change Organization',
                    headerTitleAlign: 'center',
                    headerBackTitleVisible: false,
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
                    headerBackImage: renderBackArrow,
                    headerShown: true,
                  }}
                />
                {/* <Stack.Screen
                  name={LAUNCHPAD_SCREEN}
                  component={LaunchpadContainer}
                  options={{
                    title: 'Lauchpad',
                    headerTitleAlign: 'center',
                    headerTransparent: false,
                    headerBackImage: renderWhiteBackArrow,
                    headerTintColor: Colors.WHITE,
                    headerStyle: {
                      backgroundColor: Colors.GREEN_MAIN,
                    },
                    headerShown: true,
                    headerBackTitleVisible: false,
                    animationEnabled: true,
                  }}
                /> */}

                <Stack.Screen
                  name={REQUEST_DEMO}
                  component={RequestDemoContainer}
                  options={{
                    title: 'Request a Demo',
                    headerTitleAlign: 'center',
                    headerTransparent: false,
                    headerBackImage: renderWhiteBackArrow,
                    headerTintColor: Colors.WHITE,
                    headerStyle: {
                      backgroundColor: Colors.GREEN_MAIN,
                    },
                    headerShown: true,
                    headerBackTitleVisible: false,
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
                    title: '',
                    headerShown: true,
                    animationEnabled: true,
                  }}
                />

                <Stack.Screen
                  name={CHANGE_AVATAR}
                  component={CurrentAvatar}
                  options={{
                    title: 'Profile Avatar',
                    headerBackTitleVisible: false,
                    headerTitleAlign: 'center',
                    headerBackImage: renderWhiteBackArrow,
                    headerTintColor: Colors.WHITE,
                    headerStyle: {
                      backgroundColor: Colors.GREEN_MAIN,
                    },
                    headerShown: true,
                    animationEnabled: true,
                  }}
                />

                <Stack.Screen
                  name={AVATAR_CHANGED}
                  component={AvatarChanged}
                  options={{
                    headerTransparent: true,
                    title: 'Profile Avatar',
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
                    headerTitleAlign: 'center',
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
      </SafeAreaProvider>
    </>
  )
}

export default ApplicationNavigator
