import { useTheme } from '@/Hooks'
import React, { useRef } from 'react'
import { StyleSheet, Dimensions, ImageBackground } from 'react-native'
import { View, Text, TouchableOpacity, Image } from 'react-native-ui-lib'
// import athena from '@/Assets/gifs/athena.gif'
import { botNavBG } from '@/Components/Images'
// import Athena from '@/Assets/Images/png/athenaFace.svg'
// import AthenaChatContainer, {
//   RefProps,
// } from '@/Containers/Chat/AthenaChatContainer'
import { athenaFaceXML } from '@/Assets/Images/xml-svg/athenaFace'
import { SvgCss } from 'react-native-svg'
import { ATHENA_CHAT_SCREEN } from '@/Constants/screens'

interface Props {
  state: any
  descriptors: any
  navigation: any
}

const CustomTabNavigation = ({ state, descriptors, navigation }: Props) => {
  const { Colors, Fonts } = useTheme()
  // const chatRef = useRef<RefProps>()

  const onPress = (route: any, isFocused: any) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    })

    if (!isFocused && !event.defaultPrevented) {
      // The `merge: true` option makes sure that the params inside the tab screen are preserved
      navigation.navigate({ name: route.name, merge: true })
    }
  }

  const insightsOptions = descriptors[state.routes[0].key]
  const [insightsRoute, dashboardRoute] = state.routes
  const [isFocusedInsights, isFocusedDashboard] = [
    state.index === 0,
    state.index === 1,
    // state.index === 2,
  ]

  const openChat = () => {
    navigation.navigate({ name: ATHENA_CHAT_SCREEN, merge: true })
    // if (chatRef && chatRef.current) {
    //   chatRef.current.open()
    // }
  }

  return (
    <ImageBackground
      resizeMode="cover"
      style={{
        // backgroundColor: 'transparent',
        marginTop: -50,
      }}
      source={botNavBG}
    >
      <View style={styles.root}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={isFocusedInsights ? { selected: true } : {}}
          accessibilityLabel={insightsOptions.tabBarAccessibilityLabel}
          onPress={() => onPress(insightsRoute, isFocusedInsights)}
          style={styles.tab}
        >
          <Text
            style={[
              Fonts.text15Bold,
              {
                color: isFocusedInsights
                  ? Colors.GREEN_MAIN
                  : Colors.GREEN_DARK,
              },
            ]}
          >
            {insightsRoute.name}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          // accessibilityState={isFocusedChat ? { selected: true } : {}}
          // accessibilityLabel={insightsOptions.tabBarAccessibilityLabel}
          // onPress={() => onPress(chatRoute, isFocusedChat)}
          // style={[styles.athenaBox, { borderColor: Colors.GREEN_DARK, shadowColor: Colors.GREEN_MAIN }]}
          onPress={openChat}
        >
          {/* <Athena style={styles.athena} /> */}
          {/* <Image
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
        <ImageBackground resizeMode="cover" style={{ marginTop: 50 }} source={botNavBG}>
            <View style={styles.root}>
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityState={isFocusedInsights ? { selected: true } : {}}
                    accessibilityLabel={insightsOptions.tabBarAccessibilityLabel}
                    onPress={() => onPress(insightsRoute, isFocusedInsights)}
                    style={styles.tab}
                >
                    <Text style={[Fonts.text15Bold, { color: isFocusedInsights ? Colors.GREEN_MAIN : Colors.GREEN_DARK }]}>
                        {insightsRoute.name}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    accessibilityState={isFocusedChat ? { selected: true } : {}}
                    accessibilityLabel={insightsOptions.tabBarAccessibilityLabel}
                    onPress={() => onPress(chatRoute, isFocusedChat)}

                    // style={[styles.athenaBox, { borderColor: Colors.GREEN_DARK, shadowColor: Colors.GREEN_MAIN }]}
                >
                    {/* <Athena style={styles.athena}/> */}
          <SvgCss width="100" height="100" xml={athenaFaceXML} />
          {/* <Image
                        source={athena}
                        resizeMode='cover'
                        style={styles.athena} /> */}
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={isFocusedDashboard ? { selected: true } : {}}
          accessibilityLabel={insightsOptions.tabBarAccessibilityLabel}
          onPress={() => onPress(dashboardRoute, isFocusedDashboard)}
          style={styles.tab}
        >
          <Text
            style={[
              Fonts.text15Bold,
              {
                color: isFocusedDashboard
                  ? Colors.GREEN_MAIN
                  : Colors.GREEN_DARK,
              },
            ]}
          >
            {dashboardRoute.name}
          </Text>
        </TouchableOpacity>
      </View>
      {/* <AthenaChatContainer ref={chatRef} /> */}
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignContent: 'center',
    height: 100,
  },
  tabAthena: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'center',
  },
  tab: {
    marginTop: 35,
    borderColor: '#FFF',
    flex: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  athenaBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 4,
    elevation: 10,
  },
  athena: {
    borderRadius: 40,
    alignSelf: 'center',
    width: 82,
    height: 82,
    top: -5,
    zIndex: 2,
  },
})

export default CustomTabNavigation
