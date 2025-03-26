import React from 'react'
import { Dimensions, Pressable, StatusBar, StyleSheet } from 'react-native'
import { Avatar, Text, TouchableOpacity, View } from 'react-native-ui-lib'
import { useTranslation } from 'react-i18next'
import { DrawerNavigationState, ParamListBase } from '@react-navigation/native'
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer'
import {
  DrawerContentComponentProps,
  DrawerDescriptorMap,
  DrawerNavigationHelpers,
} from '@react-navigation/drawer/lib/typescript/src/types'

import {
  READ_FAQ,
  BOTTOM_TAB_NAVIGATOR,
  SETTINGS,
  WALK_THROUGH_AUTHORIZED,
  REQUEST_DEMO,
  CHANGE_ORGANIZATION,
  WT_INSIGHTS,
  LAUNCHPAD_SCREEN,
} from '@/Constants/screens'
import BottomTabNavigator from './BottomTabNavigator'
import { useTheme, useAppDispatch, useAuth, useOrganization } from '@/Hooks'
import { useLazyLogoutQuery } from '@/Services/modules/auth'
import { cleanupAuthData } from '@/Store/Auth'
import { cleanupAppData } from '@/Store/App'
import { Button } from '@/Components'

import MoreIcon from '@/Assets/Images/iconsSVG/more.svg'
import SettingsIcon from '@/Assets/Images/iconsSVG/settings.svg'
import InsightsIcon from '@/Assets/Images/drawer/insights.svg'
import DashboardIcon from '@/Assets/Images/drawer/dashboard.svg'
import Icon from 'react-native-vector-icons/Ionicons'
import WalkThroughIcon from '@/Assets/Images/drawer/walkthrough.svg'
import RequestDemoIcon from '@/Assets/Images/drawer/demo.svg'
import FaqIcon from '@/Assets/Images/drawer/faq.svg'
import DownArrow from '@/Assets/Images/drawer/down-arrow.svg'
import TrackPlayer from 'react-native-track-player'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { cleanupHostData } from '@/Store/HostURL'

interface Props {
  state: DrawerNavigationState<ParamListBase>
  navigation: DrawerNavigationHelpers
  descriptors: DrawerDescriptorMap
}

interface DrawerViewProps {
  handleRedirect: (screen: string) => void
}

const Drawer = createDrawerNavigator()

const DrawerView = ({ handleRedirect }: DrawerViewProps) => {
  const { Fonts, Colors, Layout } = useTheme()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { signInOrg } = useOrganization()
  const { authData } = useAuth()
  const [logout, { isLoading }] = useLazyLogoutQuery()
  const { width: windowWidth } = Dimensions.get('window')

  const handleSignout = async () => {
    await logout()
    dispatch(cleanupAuthData())
    dispatch(cleanupAppData())
    dispatch(cleanupHostData())
    await AsyncStorage.clear();
    TrackPlayer.pause()
  }

  return (
    <DrawerContentScrollView>
      <View style={Layout.center}>
        <View style={styles.topBar}>
          <TouchableOpacity>
            <MoreIcon />
          </TouchableOpacity>
          <Text style={[Fonts.textRegular, styles.welcome]}>Welcome</Text>
          <TouchableOpacity onPress={() => handleRedirect(SETTINGS)}>
            <SettingsIcon />
          </TouchableOpacity>
        </View>
        <View center style={styles.avatar}>
          <Avatar size={100} />
          <Text
            marginT-20
            marginB-4
            style={{ ...Fonts.text20Bold, color: Colors.GREEN_DARK }}
          >
            {authData?.displayName}
          </Text>
          <Pressable
            // onPress={
            //   isSingleOrg ? undefined : () => handleRedirect(CHANGE_ORGANIZATION)
            // }
            style={styles.changeOrg}
          >
            <Text color={Colors.GREEN_MAIN}>{signInOrg?.name}</Text>
            {/* {!isSingleOrg && <DownArrow style={styles.downArrow} />} */}
          </Pressable>
        </View>

        <View
          marginT-16
          style={{
            ...styles.screensLinks,
            width: windowWidth - 130,
          }}
        >
          <View marginV-15 height={1} backgroundColor={Colors.GRAY} />
          <TouchableOpacity
            onPress={() => handleRedirect(t('bottomTabs.insights'))}
            style={styles.screenLink}
          >
            <InsightsIcon />
            <Text
              style={[styles.linkText, { color: Colors.GREEN_DARK }]}
              marginL-25
            >
              Insights
            </Text>
          </TouchableOpacity>
          <View marginV-15 height={1} backgroundColor={Colors.GRAY} />
          <TouchableOpacity
            onPress={() => handleRedirect(t('bottomTabs.dashboard'))}
            style={styles.screenLink}
          >
            <DashboardIcon />
            <Text
              style={[styles.linkText, { color: Colors.GREEN_DARK }]}
              marginL-25
            >
              Dashboard
            </Text>
          </TouchableOpacity>
          <View marginV-15 height={1} backgroundColor={Colors.GRAY} />
          {/* <TouchableOpacity
            onPress={() => handleRedirect(LAUNCHPAD_SCREEN)}
            style={styles.screenLink}
          >
            <Icon name={'grid'} size={28} color={Colors.GREEN_MAIN} />
            <Text
              style={[styles.linkText, { color: Colors.GREEN_DARK }]}
              marginL-25
            >
              Launchpad
            </Text>
          </TouchableOpacity>

          <View marginV-15 height={1} backgroundColor={Colors.GRAY} /> */}
          {/* to view and access Launchpad in DrawerNavigator please uncommand the
          above codes. */}

          {/* <TouchableOpacity
            onPress={() => handleRedirect(WALK_THROUGH_AUTHORIZED)}
            style={styles.screenLink}
          >
            <WalkThroughIcon />
            <Text
              style={[styles.linkText, { color: Colors.GREEN_DARK }]}
              marginL-25
            >
              Walkthrough
            </Text>
          </TouchableOpacity>
          <View marginV-15 height={1} backgroundColor={Colors.GRAY} />  */}
          <TouchableOpacity
            onPress={() => handleRedirect(REQUEST_DEMO)}
            style={styles.screenLink}
          >
            <RequestDemoIcon />
            <Text
              style={[styles.linkText, { color: Colors.GREEN_DARK }]}
              marginL-25
            >
              Request a Demo
            </Text>
          </TouchableOpacity>
          <View marginV-15 height={1} backgroundColor={Colors.GRAY} />
          {/* <TouchableOpacity
            onPress={() => handleRedirect(READ_FAQ)}
            style={styles.screenLink}
          >
            <FaqIcon />
            <Text
              style={[styles.linkText, { color: Colors.GREEN_DARK }]}
              marginL-25
            >
              Read FAQ
            </Text>
          </TouchableOpacity>
          <View marginV-15 height={1} backgroundColor={Colors.GRAY} /> */}
        </View>
        <View marginT-24 width={300}>
          <Button
            dark={true}
            block={true}
            label={'Sign Out'}
            loading={isLoading}
            disabled={isLoading}
            onPress={handleSignout}
          />
        </View>
      </View>
    </DrawerContentScrollView>
  )
}

export default function DrawerNavigator({ navigation }: Props) {
  const handleRedirect = (screen: string) => {
    navigation.navigate(screen)
  }

  const renderDrawerView = (props: DrawerContentComponentProps) => (
    <DrawerView {...props} handleRedirect={handleRedirect} />
  )

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: { width: '90%' },
      }}
      drawerContent={renderDrawerView}
      initialRouteName={BOTTOM_TAB_NAVIGATOR}
    >
      <Drawer.Screen
        options={{ headerShown: false }}
        // name={t('bottomTabs.insights')}
        name={BOTTOM_TAB_NAVIGATOR}
        component={BottomTabNavigator}
      />
    </Drawer.Navigator>
  )
}

const styles = StyleSheet.create({
  topBar: {
    width: '92%',
    padding: '4%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  welcome: { fontSize: 16 },
  avatar: {
    flex: 3,
  },
  changeOrg: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  downArrow: { marginLeft: 5 },
  screensLinks: {
    flex: 8,
  },
  screenLink: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontFamily: 'Montserrat-SemiBold',
  },
})
