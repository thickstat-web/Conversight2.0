import { useTheme } from '@/Hooks';
import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { View, Text, TouchableOpacity, Image } from 'react-native-ui-lib';
import test from "@/Assets/gifs/athenaGif.gif"

interface Props {
    state: any,
    descriptors: any,
    navigation: any
}

const CustomTabNavigation = ({ state, descriptors, navigation }: Props) => {
    const { Colors, Fonts } = useTheme()
    const { width: screenWidth, height: screenHeight } = Dimensions.get("screen")

    const onPress = (route: any, isFocused: any) => {
        const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate({ name: route.name, merge: true });
        }
    };

    const insightsOptions = descriptors[state.routes[0].key];
    const [insightsRoute, chatRoute, dashboardRoute] = state.routes
    const [isFocusedInsights, isFocusedChat, isFocusedDashboard] = [state.index === 0, state.index === 1, state.index === 2]


    return (
        <View style={styles.root}>
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocusedInsights ? { selected: true } : {}}
                accessibilityLabel={insightsOptions.tabBarAccessibilityLabel}
                onPress={() => onPress(insightsRoute, isFocusedInsights)}
                style={[styles.tab, styles.borderRight]}
            >
                <Text style={[Fonts.text15Bold, { color: isFocusedInsights ? Colors.GREEN_MAIN : Colors.GREEN_DARK }]}>
                    {insightsRoute.name}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                accessibilityState={isFocusedChat ? { selected: true } : {}}
                accessibilityLabel={insightsOptions.tabBarAccessibilityLabel}
                onPress={() => onPress(chatRoute, isFocusedChat)}

                style={[styles.athenaBox, { borderColor: Colors.GREEN_DARK, shadowColor: Colors.GREEN_MAIN }]}
            >
                <Image
                    source={test}
                    resizeMode='cover'
                    style={styles.athena} />

            </TouchableOpacity>

            <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocusedDashboard ? { selected: true } : {}}
                accessibilityLabel={insightsOptions.tabBarAccessibilityLabel}
                onPress={() => onPress(dashboardRoute, isFocusedDashboard)}
                style={[styles.tab, styles.borderLeft]}
            >

                <Text style={[Fonts.text15Bold, { color: isFocusedDashboard ? Colors.GREEN_MAIN : Colors.GREEN_DARK }]}>
                    {dashboardRoute.name}
                </Text>

            </TouchableOpacity>
            <View style={{
                width: screenWidth,
                backgroundColor: Colors.GRAY,
                position: 'absolute',
                zIndex: 1,
                height: 15,
                bottom: 0
            }} />
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flexDirection: 'row',
        height: 50,
        alignContent: "center",

    },
    tabAthena: {
        flex: 1,
        alignItems: "center",
        alignSelf: "center"
    },
    tab: {
        borderWidth: 4,
        borderColor: "#FFF",
        flex: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    borderLeft: {
        borderTopLeftRadius: 300,
        borderBottomEndRadius: 110,
        borderTopEndRadius: 80,
        marginLeft: -16,
    },
    borderRight: {
        position:"relative",
        borderTopEndRadius: 308,
        borderBottomStartRadius: 110,
        borderTopStartRadius: 80,
        marginRight: -16,
    },
    athenaBox: {
        top: -20,
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 3,
        zIndex: 2,
        elevation: 20,

    },
    athena: {
        borderRadius: 30,
        alignSelf: 'center',
        width: 60,
        height: 60,
        top: -3,
        zIndex: 2,
    },


})

export default CustomTabNavigation