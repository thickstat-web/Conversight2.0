import React, { useCallback, useEffect } from 'react'
import { ScrollView, StyleSheet, Dimensions } from 'react-native'
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Slider,
} from 'react-native-ui-lib'
import { useTheme, useAppDispatch, useAppSelector } from '@/Hooks'
import { useGetSettingsMutation } from '@/Services/modules/settings'
import {
  setProfileSettings,
  selectProfile,
  selectPreference,
} from '@/Store/Settings'
import { GET_SETTING_QUERY } from '@/Constants/api'
import { NavigationProp, ParamListBase } from '@react-navigation/native'
import { CHANGE_AVATAR } from '@/Constants/screens'

interface Props {
  navigation: NavigationProp<ParamListBase>
}

const SettingsContainer = ({ navigation }: Props) => {
  const { width: screenWidth } = Dimensions.get('screen')
  const { Colors, Fonts } = useTheme()
  const dispatch = useAppDispatch()
  const [getSettings, { data: profile, isLoading, isSuccess }] =
    useGetSettingsMutation()

  const { displayName, email, designation, mobileNum, chatPageDisabled } =
    useAppSelector(selectProfile)
  const {
    allow_athena,
    // voice_speed,
    // provide_suggestion,
    // save_conversation,
    // sound_cues,
  } = useAppSelector(selectPreference)

  const fetchProfileSettings = useCallback(async () => {
    const { success, data } = await getSettings({
      query: GET_SETTING_QUERY,
    }).unwrap()
    if (success) {
      dispatch(setProfileSettings(data))
    }
  }, [dispatch, getSettings])

  useEffect(() => {
    fetchProfileSettings()
  }, [fetchProfileSettings])

  const textStyle = { ...Fonts.textSmall, color: Colors.DARK }
  const boldText = [textStyle, { fontFamily: "Montserrat-SemiBold" }]

  return (
    <ScrollView>
      <View>
        <Text
          style={{ ...Fonts.textRegular, fontSize: 16 }}
          marginH-25
          marginV-15
        >
          USER INFO
        </Text>
        <View backgroundColor={Colors.WHITE}>
          <View
            marginH-25
            paddingV-14
            style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}
          >
            <Text style={[textStyle, { fontFamily: "Montserrat-SemiBold" }]}>Avatar</Text>
            <TouchableOpacity onPress={() => navigation.navigate(CHANGE_AVATAR)}>
              <Text style={[textStyle, { color: Colors.GREEN_MAIN, fontFamily: "Montserrat-Bold" }]} >Upload New profile Pic</Text>
            </TouchableOpacity>
          </View>
          <View
            marginH-25
            paddingV-14
            style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}
          >
            <Text style={boldText}>Name</Text>
            <Text style={textStyle}>{displayName}</Text>
          </View>
          <View
            marginH-25
            paddingV-14
            style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}
          >
            <Text style={boldText}>Email</Text>
            <Text style={textStyle}>{email}</Text>
          </View>
          <View
            marginH-25
            paddingV-14
            style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}
          >
            <Text style={boldText}>Mobile</Text>
            <Text style={textStyle}>{mobileNum}</Text>
          </View>
          <View
            marginH-25
            paddingV-14
            style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}
          >
            <Text style={boldText}>Designation</Text>
            <Text style={textStyle}>{designation}</Text>
          </View>
        </View>
        <Text
          style={{ ...Fonts.textRegular, fontSize: 16 }}
          marginH-25
          marginV-15
        >
          USER SETTINGS
        </Text>

        <View backgroundColor={Colors.WHITE}>
          <View
            marginH-25
            paddingV-14
            style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}
          >
            <Text style={boldText}>Athena's Voice</Text>
          </View>
          <View
            marginH-25
            paddingV-14
            style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}
          >
            <Text style={boldText}>Speed</Text>
            <View width={screenWidth / 3}>
              <Slider
                value={4}
                maximumValue={10}
                minimumValue={0}
                maximumTrackTintColor={Colors.GRAY}
                minimumTrackTintColor={Colors.GREEN_MAIN}
                thumbTintColor={Colors.GREEN_MAIN}
                thumbStyle={{ borderWidth: 0 }}
                activeThumbStyle={{ borderWidth: 0 }}
                disableActiveStyling
              />
            </View>
          </View>
          <View
            marginH-25
            paddingV-14
            style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}
          >
            <Text style={boldText}>Pitch</Text>
            <View width={screenWidth / 3}>
              <Slider
                value={4}
                maximumValue={10}
                minimumValue={0}
                maximumTrackTintColor={Colors.GRAY}
                minimumTrackTintColor={Colors.GREEN_MAIN}
                thumbTintColor={Colors.GREEN_MAIN}
                thumbStyle={{ borderWidth: 0 }}
                activeThumbStyle={{ borderWidth: 0 }}
                disableActiveStyling
              />
            </View>
          </View>
          <View
            marginH-25
            paddingV-14
            style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}
          >
            <Text style={boldText}>Read Messages</Text>
            <Switch
              offColor={Colors.GRAY}
              value={chatPageDisabled}
              onColor={Colors.GREEN_MAIN}
            />
          </View>
          <View
            marginH-25
            paddingV-14
            style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}
          >
            <Text style={boldText}>Proactive Insights</Text>
            <Switch
              offColor={Colors.GRAY}
              value={allow_athena}
              onColor={Colors.GREEN_MAIN}
            />
          </View>
          <View
            marginH-25
            paddingV-14
            style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}
          >
            <Text style={boldText}>Walkthrough in Menu</Text>
            <Switch
              offColor={Colors.GRAY}
              value={true}
              onColor={Colors.GREEN_MAIN}
            />
          </View>
          <View
            marginH-25
            paddingV-14
            style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}
          >
            <Text style={boldText}>Delay (sec)</Text>
            <View width={screenWidth / 3}>
              <Slider
                value={4}
                maximumValue={10}
                minimumValue={0}
                maximumTrackTintColor={Colors.GRAY}
                minimumTrackTintColor={Colors.GREEN_MAIN}
                thumbTintColor={Colors.GREEN_MAIN}
                thumbStyle={{ borderWidth: 0 }}
                activeThumbStyle={{ borderWidth: 0 }}
                disableActiveStyling
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {},
  settingBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
})

export default SettingsContainer
