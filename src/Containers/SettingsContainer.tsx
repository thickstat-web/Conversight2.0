import { View, Text, TouchableOpacity, Switch } from 'react-native-ui-lib'
import React, { useEffect } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { useTheme } from '@/Hooks'
import { useGetSettingsMutation } from '@/Services/modules/settings'
import { store } from '@/Store'
import { GET_SETTING_QUERY } from '@/Constants/api'
import { setCurrentSettings } from '@/Store/Settings'

const SettingsContainer = () => {
  const { Colors, Fonts } = useTheme()
  const [getSettings, { data, error }] = useGetSettingsMutation()
  const { authData: { token } } = store.getState().authReducer
  const { displayName, email, designation, mobileNum, chatPageDisabled} = store.getState().settingsReducer
  const { allow_athena, voice_speed, provide_suggestion, save_conversation, sound_cues } = store.getState().settingsReducer?.preference
  useEffect(() => {
    if (error) {
      // set some error here
      console.log(error)
    } else if (data?.data) {
      store.dispatch(setCurrentSettings(data.data))
    }
  }, [data, error])

  useEffect(() => {
    getSettings({ token: token, query: GET_SETTING_QUERY })
  }, [])
  const textStyle = { ...Fonts.textSmall, color: Colors.DARK }

  return (
    <ScrollView >
      <View >
        <Text style={{ ...Fonts.textRegular, fontSize: 16 }} marginH-25 marginV-15>USER INFO</Text>
        <View backgroundColor={Colors.WHITE}>
          <View marginH-25 paddingV-14 style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}>
            <Text style={textStyle}>Avatar</Text>
            <TouchableOpacity>
              <Text style={textStyle}>Upload New profile Pic</Text>
            </TouchableOpacity>
          </View>
          <View marginH-25 paddingV-14 style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}>
            <Text style={textStyle}>Name</Text>
            <Text style={textStyle}>{displayName || "..."}</Text>
          </View>
          <View marginH-25 paddingV-14 style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}>
            <Text style={textStyle}>Email</Text>
            <Text style={textStyle}>{email}</Text>
          </View>
          <View marginH-25 paddingV-14 style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}>
            <Text style={textStyle}>Mobile</Text>
            <Text style={textStyle}>{mobileNum}</Text>
          </View>
          <View marginH-25 paddingV-14 style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}>
            <Text style={textStyle}>Designation</Text>
            <Text style={textStyle}>{designation}</Text>
          </View>
        </View>
        <Text style={{ ...Fonts.textRegular, fontSize: 16 }} marginH-25 marginV-15>USER SETTINGS</Text>

        <View backgroundColor={Colors.WHITE}>
          <View marginH-25 paddingV-14 style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}>
            <Text style={textStyle}>Athena's Voice</Text>
            <Text>xxx</Text>
          </View>
          <View marginH-25 paddingV-14 style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}>
            <Text style={textStyle}>Speed</Text>
            <Text>{voice_speed}</Text>
          </View>
          <View marginH-25 paddingV-14 style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}>
            <Text style={textStyle}>Pitch</Text>
            <Text>xxx</Text>
          </View>
          <View marginH-25 paddingV-14 style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}>
            <Text style={textStyle}>Read Messages</Text>
            <Switch value={chatPageDisabled} onColor={Colors.GREEN_MAIN} />
          </View>
          <View marginH-25 paddingV-14 style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}>
            <Text style={textStyle}>Proactive Insights</Text>
            <Switch value={allow_athena} onColor={Colors.GREEN_MAIN} />
          </View>
          <View marginH-25 paddingV-14 style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}>
            <Text style={textStyle}>Walkthrough in Menu</Text>
            <Switch value={true} onColor={Colors.GREEN_MAIN} />
          </View>
          <View marginH-25 paddingV-14 style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}>
            <Text style={textStyle}>Delay (sec)</Text>
            <Text>xxx</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {

  },
  settingBox: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 0
  }
})

export default SettingsContainer