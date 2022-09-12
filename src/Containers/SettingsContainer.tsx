import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { ScrollView, StyleSheet, Dimensions } from 'react-native'
import { View, Text, TouchableOpacity, Switch, Hint } from 'react-native-ui-lib'
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
import DownArrow from '@/Assets/Images/drawer/down-arrow.svg'
import { Slider } from '@miblanchard/react-native-slider'

interface Props {
  navigation: NavigationProp<ParamListBase>
}

interface HintProps {
  props: React.ReactNode
}

const SettingsContainer = ({ navigation }: Props) => {
  const { width: screenWidth } = Dimensions.get('screen')
  const { Colors, Fonts, Layout } = useTheme()
  const dispatch = useAppDispatch()
  const [emailOpen, setEmailOpen] = useState<boolean>(false)
  const [speed, setSpeed] = useState<number>(2)
  const [pitch, setPitch] = useState<number>(2)
  const [delay, setDelay] = useState<number>(2)

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

  const textStyle = {
    ...Fonts.textSmall,
    color: Colors.DARK,
    fontFamily: 'Montserrat-Medium',
  }
  const boldText = [textStyle, { fontFamily: 'Montserrat-SemiBold' }]

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
          {/* <View
            marginH-25
            paddingV-14
            style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}
          >
            <Text style={[textStyle, { fontFamily: 'Montserrat-SemiBold' }]}>
              Avatar
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(CHANGE_AVATAR)}
            >
              <Text style={[textStyle, { color: Colors.GREEN_MAIN }]}>
                Change
              </Text>
            </TouchableOpacity>
          </View> */}
          <View
            marginH-25
            paddingV-14
            style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}
          >
            <Text style={boldText}>Name</Text>
            <Text style={textStyle}>{displayName}</Text>
          </View>
          <Hint
            color={Colors.WHITE}
            enableShadow
            edgeMargins={1}
            messageStyle={textStyle}
            containerWidth={screenWidth}
            message={email}
            borderRadius={8}
            visible={emailOpen}
            customContent={
              <View style={{ paddingVertical: 6 }}>
                <Text selectable={true} style={[textStyle]}>
                  {email}
                </Text>
              </View>
            }
            onBackgroundPress={() => setEmailOpen(false)}
            // onPress={}
          >
            <TouchableOpacity
              marginH-25
              onPress={() => setEmailOpen(true)}
              paddingV-14
              style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}
            >
              <Text style={boldText}>Email</Text>
              <Text
                numberOfLines={1}
                style={[textStyle, { width: screenWidth * 0.7 }]}
              >
                {email}
              </Text>
            </TouchableOpacity>
          </Hint>
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
        {/* <Text
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
            <TouchableOpacity>
              <View style={Layout.rowCenter}>
                <Text style={[Fonts.textSmall, { color: Colors.GREEN_MAIN }]} >Shazza</Text>
                <DownArrow style={{ marginHorizontal: 10 }} />
              </View>
            </TouchableOpacity>
          </View>
          <View
            marginH-25
            paddingV-14
            style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}
          >
            <View style={styles.sliderVal}>
              <Text style={boldText}>Speed</Text>
              <Text style={[styles.sliderValue, { backgroundColor: Colors.GRAY, color: Colors.GREEN_DARK }]}>{speed}</Text>
            </View>
            <View width={screenWidth / 3}>
              <Slider
                containerStyle={{ height: 25 }}
                value={speed}
                onValueChange={(v) => setSpeed(+v)}
                maximumValue={10}
                minimumValue={0}
                step={1}
                maximumTrackTintColor={Colors.GRAY}
                minimumTrackTintColor={Colors.GRAY}
                thumbTintColor={Colors.GREEN_MAIN}
                trackStyle={{ height: 6 }}
                thumbStyle={{ width: 22, height: 22, borderRadius: 11 }}
              />
            </View>
          </View>
          <View
            marginH-25
            paddingV-14
            style={{ ...styles.settingBox, borderBottomColor: Colors.GRAY }}
          >
            <View style={styles.sliderVal}>
              <Text style={boldText}>Pitch</Text>
              <Text style={[styles.sliderValue, { backgroundColor: Colors.GRAY, color: Colors.GREEN_DARK }]}>{pitch}</Text>
            </View>
            <View width={screenWidth / 3}>
              <Slider
                containerStyle={{ height: 25 }}
                value={pitch}
                onValueChange={(v) => setPitch(+v)}
                maximumValue={10}
                minimumValue={0}
                maximumTrackTintColor={Colors.GRAY}
                minimumTrackTintColor={Colors.GRAY}
                thumbTintColor={Colors.GREEN_MAIN}
                step={1}
                trackStyle={{ height: 6 }}
                thumbStyle={{ width: 22, height: 22, borderRadius: 11 }}
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
            <View style={styles.sliderVal}>
              <Text style={boldText}>Delay (sec)</Text>
              <Text style={[styles.sliderValue, { backgroundColor: Colors.GRAY, color: Colors.GREEN_DARK }]}>{delay}</Text>
            </View>
            <View width={screenWidth / 3}>
              <Slider
                containerStyle={{ height: 25 }}
                value={delay}
                onValueChange={(v) => setDelay(+v)}
                step={1}
                maximumValue={10}
                minimumValue={0}
                maximumTrackTintColor={Colors.GRAY}
                minimumTrackTintColor={Colors.GRAY}
                thumbTintColor={Colors.GREEN_MAIN}
                trackStyle={{ height: 6 }}
                thumbStyle={{ width: 22, height: 22, borderRadius: 11 }}
              />
            </View>
          </View>
        </View> */}
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
  sliderVal: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderValue: {
    marginLeft: 5,
    paddingHorizontal: 12,
    fontFamily: 'Montserrat-Bold',
    paddingVertical: 3,
    borderRadius: 34,
  },
})

export default SettingsContainer
