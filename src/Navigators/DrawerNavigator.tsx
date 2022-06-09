import React from 'react'
import { Dimensions, StyleSheet } from 'react-native'
import { Avatar, Text, TouchableOpacity, View } from 'react-native-ui-lib'
import { useTranslation } from 'react-i18next'
import { DrawerNavigationState, ParamListBase } from '@react-navigation/native'
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer'
import {
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
} from '@/Constants/screens'
import BottomTabNavigator from './BottomTabNavigator'
import { useTheme, useAppDispatch, useAppSelector, useAuth } from '@/Hooks'
import { useLazyLogoutQuery } from '@/Services/modules/auth'
import { cleanupAuthData, selectAllOrganizations, selectSignInOrg } from '@/Store/Auth'
import { Button } from '@/Components'

import MoreIcon from '@/Assets/Images/iconsSVG/more.svg'
import SettingsIcon from '@/Assets/Images/iconsSVG/settings.svg'
import InsightsIcon from '@/Assets/Images/drawer/insights.svg'
import DashboardIcon from '@/Assets/Images/drawer/dashboard.svg'
import WalkThroughIcon from '@/Assets/Images/drawer/walkthrough.svg'
import RequestDemoIcon from '@/Assets/Images/drawer/demo.svg'
import FaqIcon from '@/Assets/Images/drawer/faq.svg'
import DownArrow from '@/Assets/Images/drawer/down-arrow.svg'

interface Props {
  state: DrawerNavigationState<ParamListBase>
  navigation: DrawerNavigationHelpers
  descriptors: DrawerDescriptorMap
}

interface Props2 {
  navigation: any
}

const Drawer = createDrawerNavigator()

export default function DrawerNavigator({ navigation }: Props2) {
  const { Fonts, Colors, Layout } = useTheme()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [logout, { isLoading }] = useLazyLogoutQuery()
  const { authData } = useAuth()
  const selectedOrg = useAppSelector(selectSignInOrg)
  const { height: windowHeight, width: windowWidth } = Dimensions.get('window')
  const singleOrg = useAppSelector(selectAllOrganizations).length === 1

  const handleRedirect = (screen: string) => {
    navigation.navigate(screen)
  }

  const handleSignout = async () => {
    await logout()
    dispatch(cleanupAuthData())
  }

  const DrawerView = (props: Props) => {
    return (
      <DrawerContentScrollView>
        <View style={Layout.center}>
          <View style={styles.topBar}>
            <TouchableOpacity>
              <MoreIcon />
            </TouchableOpacity>
            <Text style={{ ...Fonts.textRegular, fontSize: 16 }}>Welcome</Text>
            <TouchableOpacity onPress={() => handleRedirect(SETTINGS)}>
              <SettingsIcon />
            </TouchableOpacity>
          </View>
          <View center style={styles.avatar}>
            <Avatar size={100} />
            <Text
              marginT-20
              style={{ ...Fonts.text20Bold, color: Colors.GREEN_DARK }}
            >
              {authData?.displayName}
            </Text>
            <TouchableOpacity

              onPress={singleOrg ? () => { } : () => handleRedirect(CHANGE_ORGANIZATION)}
              style={styles.changeOrg}
            >
              <Text color={Colors.GREEN_MAIN}>{selectedOrg?.name}</Text>
              {!singleOrg && <DownArrow style={{ marginLeft: 5 }} />}

            </TouchableOpacity>
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
              onPress={() => handleRedirect(WT_INSIGHTS)}
              style={styles.screenLink}
            >
              <InsightsIcon />
              <Text marginL-25>Insights</Text>
            </TouchableOpacity>
            <View marginV-15 height={1} backgroundColor={Colors.GRAY} />
            <TouchableOpacity
              onPress={() => handleRedirect(t('bottomTabs.dashboard'))}
              style={styles.screenLink}
            >
              <DashboardIcon />
              <Text marginL-25>Dashboard</Text>
            </TouchableOpacity>
            <View marginV-15 height={1} backgroundColor={Colors.GRAY} />

            <TouchableOpacity
              onPress={() => handleRedirect(WALK_THROUGH_AUTHORIZED)}
              style={styles.screenLink}
            >
              <WalkThroughIcon />
              <Text marginL-25>Walkthrough</Text>
            </TouchableOpacity>
            <View marginV-15 height={1} backgroundColor={Colors.GRAY} />

            <TouchableOpacity
              onPress={() => handleRedirect(REQUEST_DEMO)}
              style={styles.screenLink}
            >
              <RequestDemoIcon />
              <Text marginL-25>Request a Demo</Text>
            </TouchableOpacity>
            <View marginV-15 height={1} backgroundColor={Colors.GRAY} />

            <TouchableOpacity
              onPress={() => handleRedirect(READ_FAQ)}
              style={styles.screenLink}
            >
              <FaqIcon />
              <Text marginL-25>Read FAQ</Text>
            </TouchableOpacity>
            <View marginV-15 height={1} backgroundColor={Colors.GRAY} />
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

  return (
    <Drawer.Navigator
      screenOptions={{ drawerStyle: { width: '90%' } }}
      drawerContent={props => <DrawerView {...props} />}
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
  root: {},
  topBar: {
    width: '92%',
    padding: '4%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  avatar: {
    flex: 3,
  },
  changeOrg: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  screensLinks: {
    flex: 8,
  },
  screenLink: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
})
