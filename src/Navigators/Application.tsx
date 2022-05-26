import React from 'react'
import { SafeAreaView, StatusBar } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import { ReadFAQ, StartupContainer } from '@/Containers'
import { useTheme } from '@/Hooks'
import { navigationRef } from './utils'
import { CHANGE_ORGANIZATION, CHANGE_ORGANIZATION_PASSWORD, READ_FAQ, REQUEST_DEMO, SETTINGS, STARTUP_SCREEN, WALK_THROUGH_AUTHORIZED } from '@/Constants/screens'
import LoginNavigator from './Login'
import RequestDemoContainer from '@/Containers/RequestDemoContainer'
import WalkThroughAuthorizes from '@/Containers/WalkThroughAuthorizesContainer'
import BackArrow from "@/Assets/Images/iconsSVG/back.svg";
import BackArrowWhite from "@/Assets/Images/iconsSVG/back-white.svg";
import SaveIcon from "@/Assets/Images/iconsSVG/save.svg";
import SettingsContainer from '@/Containers/SettingsContainer'
import ChangeOrganizationContainer from '@/Containers/ChangeOrganizationContainer'
import ChangeOrganizationPasswordContainer from '@/Containers/ChangeOrganizationPasswordContainer'

const Stack = createStackNavigator()

// @refresh reset
const ApplicationNavigator = () => {
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
          <Stack.Screen name={STARTUP_SCREEN} component={StartupContainer} />
          <Stack.Screen
            name="Welcome"
            component={LoginNavigator}
            options={{
              animationEnabled: false,
            }}
          />

          <Stack.Screen
            name={READ_FAQ}
            component={ReadFAQ}
            options={{
              headerTitleStyle: { fontFamily: "Montserrat-regular" },
              title: "Need Help?",
              headerTitleAlign: "center",
              headerBackImage: () => <BackArrowWhite />,
              headerTintColor: Colors.WHITE,
              headerStyle: {
                backgroundColor: Colors.GREEN_MAIN
              },
              headerShown: true,
              animationEnabled: true,
            }}
          />

          <Stack.Screen
            name={SETTINGS} component={SettingsContainer}
            options={{
              headerTitleStyle: { fontFamily: "Montserrat-regular" },
              title: "Profile & Settings",
              headerTitleAlign: "center",
              headerRight: () => <SaveIcon />,
              headerTintColor: Colors.WHITE,
              headerBackImage: () => <BackArrowWhite />,
              headerStyle: {
                backgroundColor: Colors.GREEN_MAIN
              },
              headerShown: true,
            }}
          />


          <Stack.Screen
            name={CHANGE_ORGANIZATION} component={ChangeOrganizationContainer}
            options={{
              headerTitleStyle: { fontFamily: "Montserrat-regular" },
              title: "Change Organization",
              headerTitleAlign: "center",
              headerBackImage: () => <BackArrow />,
              headerShown: true,
            }}
          />

          <Stack.Screen
            name={CHANGE_ORGANIZATION_PASSWORD} component={ChangeOrganizationPasswordContainer}
            options={{
              headerTitleStyle: { fontFamily: "Montserrat-regular" },
              title: "Login",
              headerTitleAlign: "center",
              headerBackImage: () => <BackArrow />,
              headerShown: true
            }}
          />

          <Stack.Screen
            name={REQUEST_DEMO}
            component={RequestDemoContainer}
            options={{
              headerBackImage:() => <BackArrow />,
              title: "Request a Demo",
              headerTitleAlign: "center",
              headerTransparent:true,
              headerShown: true,
              animationEnabled: true,
            }}
          />

          <Stack.Screen
            name={WALK_THROUGH_AUTHORIZED}
            component={WalkThroughAuthorizes}
            options={{
              headerShown: true,
              animationEnabled: true,
            }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  )
}

export default ApplicationNavigator
