import React from 'react'
import { SafeAreaView, StatusBar } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import { useAppDispatch, useAuth, useTheme } from '@/Hooks'
import {
  AvatarChanged,
  CurrentAvatar,
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

const renderBackArrowWhite = () => <BackArrowWhite />
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
      <SafeAreaView
        style={[
          {
            flex: 0,
            backgroundColor: isSignedIn ? Colors.GREEN_MAIN : Colors.GRAY,
          },
        ]}
      >
        <StatusBar
          // barStyle={darkMode ? 'light-content' : 'dark-content'}
          barStyle={isSignedIn ? 'light-content' : 'default'}
          backgroundColor={Colors.GREEN_MAIN}
        />
      </SafeAreaView>
      <SafeAreaView
        style={[
          Layout.fill,
          { backgroundColor: isSignedIn ? Colors.WHITE : Colors.GRAY },
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
                    title: 'Home',
                    headerTitleAlign: 'center',
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
                    // headerBackImage: renderBackArrowWhite,
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
                  name={READ_FAQ}
                  component={ReadFAQ}
                  options={{
                    headerRight: SearchButton,
                    headerRightContainerStyle: { paddingRight: 15 },
                    title: 'Need Help?',
                    headerTitleAlign: 'center',
                    headerBackImage: renderBackArrowWhite,
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
                    headerTitleAlign: 'center',
                    headerRight: renderSaveIcon,
                    headerRightContainerStyle: { paddingRight: 15 },
                    headerTintColor: Colors.WHITE,
                    headerBackImage: renderBackArrowWhite,
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

                <Stack.Screen
                  name={REQUEST_DEMO}
                  component={RequestDemoContainer}
                  options={{
                    title: 'Request a Demo',
                    headerTitleAlign: 'center',
                    headerTransparent: false,
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
                    headerTitleAlign: 'center',
                    headerTransparent: true,
                    title: 'Profile Avatar',
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
      </SafeAreaView>
    </>
  )
}

export default ApplicationNavigator
