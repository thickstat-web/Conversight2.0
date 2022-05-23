import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { READ_FAQ, MAIN_SCREEN, SETTINGS, WALK_THROUGH_AUTHORIZED, REQUEST_DEMO } from '@/Constants/screens';
import { ReadFAQ } from '@/Containers';
import TabNavigator from './Tabs';
import { Avatar, Text, TouchableOpacity, View } from 'react-native-ui-lib';
import { Alert, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next'
import { DrawerDescriptorMap, DrawerNavigationHelpers, } from '@react-navigation/drawer/lib/typescript/src/types';
import { DrawerNavigationState, ParamListBase } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { useTheme } from "@/Hooks"
import { store } from '@/Store';
import MoreIcon from "@/Assets/Images/iconsSVG/more.svg"
import SettingsIcon from "@/Assets/Images/iconsSVG/settings.svg"
import InsightsIcon from "@/Assets/Images/drawer/insights.svg"
import DashboardIcon from "@/Assets/Images/drawer/dashboard.svg"
import WalkThroughIcon from "@/Assets/Images/drawer/walkthrough.svg"
import RequestDemoIcon from "@/Assets/Images/drawer/demo.svg"
import FaqIcon from "@/Assets/Images/drawer/faq.svg"
import { ButtonCustom } from '@/Components';
import SettingsContainer from '@/Containers/SettingsContainer';
import WalkThroughAuthorizes from '@/Containers/WalkThroughAuthorizesContainer';
import RequestDemoContainer from '@/Containers/RequestDemoContainer';

interface Props {

    state: DrawerNavigationState<ParamListBase>; navigation: DrawerNavigationHelpers; descriptors: DrawerDescriptorMap;
}

interface Props2 {
    navigation: any,
}

const Drawer = createDrawerNavigator();

export default function DrawerNav({ navigation }: Props2) {
    const { Fonts, Colors, Layout } = useTheme()
    const { t } = useTranslation()
    const { authData } = store.getState().authReducer;
    const { height: windowHeight, width: windowWidth } = Dimensions.get("window")

    const handleRedirect = (screen: string) => {
        navigation.navigate(screen)
    }

    const DrawerView = (props: Props) => {
        return (
            <DrawerContentScrollView >
                <View height={windowHeight - 70} style={Layout.center}>
                    <View style={styles.topBar}>
                        <TouchableOpacity >
                            <MoreIcon />
                        </TouchableOpacity>
                        <Text style={{ ...Fonts.textRegular, fontSize: 16 }}>Welcome</Text>
                        <TouchableOpacity onPress={() => handleRedirect(SETTINGS)}>
                            <SettingsIcon />
                        </TouchableOpacity>
                    </View>
                    <View center style={styles.avatar}>
                        <Avatar size={100} />
                        <Text marginT-20 style={{ ...Fonts.text20Bold, color: Colors.GREEN_DARK }}>{authData.displayName}</Text>
                        <View>
                            <Text color={Colors.GREEN_MAIN} >Org</Text>
                        </View>
                    </View>

                    <View style={{ ...styles.screensLinks, width: windowWidth - 130 }}>
                        <View marginV-15 height={1} backgroundColor={Colors.GRAY} />
                        <TouchableOpacity
                            onPress={() => handleRedirect(t('bottomTabs.insights'))}
                            style={styles.screenLink}>
                            <InsightsIcon />
                            <Text marginL-25>Insights</Text>
                        </TouchableOpacity>
                        <View marginV-15 height={1} backgroundColor={Colors.GRAY} />
                        <TouchableOpacity
                            // onPress={() => handleRedirect("todo")}
                            style={styles.screenLink}>
                            <DashboardIcon />
                            <Text marginL-25>Dashboard</Text>
                        </TouchableOpacity>
                        <View marginV-15 height={1} backgroundColor={Colors.GRAY} />

                        <TouchableOpacity
                             onPress={() => handleRedirect(WALK_THROUGH_AUTHORIZED)} 
                            style={styles.screenLink}>
                            <WalkThroughIcon />
                            <Text marginL-25>Walkthrough</Text>
                        </TouchableOpacity>
                        <View marginV-15 height={1} backgroundColor={Colors.GRAY} />

                        <TouchableOpacity
                            onPress={() => handleRedirect(REQUEST_DEMO)} 
                            style={styles.screenLink}>
                            <RequestDemoIcon />
                            <Text marginL-25>Request a Demo</Text>
                        </TouchableOpacity>
                        <View marginV-15 height={1} backgroundColor={Colors.GRAY} />

                        <TouchableOpacity
                            onPress={() => handleRedirect(READ_FAQ)}
                            style={styles.screenLink}>
                            <FaqIcon />
                            <Text marginL-25>Read FAQ</Text>
                        </TouchableOpacity>
                        <View marginV-15 height={1} backgroundColor={Colors.GRAY} />
                    </View>
                    <ButtonCustom label='Sign Out' color={Colors.GREEN_DARK} />
                </View>
            </DrawerContentScrollView>
        )
    }

    return (
        <Drawer.Navigator screenOptions={{ drawerStyle: { width: "90%" } }} drawerContent={(props) => <DrawerView {...props} />} initialRouteName={MAIN_SCREEN}>
            <Drawer.Screen name={t('bottomTabs.insights')} component={TabNavigator} />
            <Drawer.Screen name={READ_FAQ} component={ReadFAQ} />
            <Drawer.Screen name={SETTINGS} component={SettingsContainer} />
            <Drawer.Screen name={WALK_THROUGH_AUTHORIZED} component={WalkThroughAuthorizes} />
            <Drawer.Screen name={REQUEST_DEMO} component={RequestDemoContainer} />
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    root: {

    },
    topBar: {
        width: "92%",
        padding: "4%",
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    avatar: {
        flex: 5
    },
    screensLinks: {
        flex: 10
    },
    screenLink: {
        justifyContent: "flex-start",
        flexDirection: "row",
        alignItems: "center"
    },

})