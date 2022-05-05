import React, { FC, ReactElement, useRef, useEffect, useState } from 'react'
import { View, Text, Picker, Modal } from 'react-native-ui-lib'
import {
  FlatList,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native'
import { useTheme } from '@/Hooks'
import { ButtonCustom } from '@/Components'
import { store } from '@/Store'
import PickerIcon from '@/Assets/Images/iconsSVG/pickerIcon.svg'
import SelectedOptionIcon from '@/Assets/Images/iconsSVG/selectedOptionArrow.svg'
import NotSelectedOptionIcon from '@/Assets/Images/iconsSVG/notSelectedOptionArrow.svg'
import NewLabel from '@/Assets/Images/iconsSVG/newLabel.svg'
import { getOrgByOrgId } from '@/Utils/array'
import { setSelectedOrg } from '@/Store/Auth'
import { PASSWORD_SCREEN } from '@/Constants/screens'

type Item = {
  orgId: string
  name: string
  item: string
}

type Org = {
  item: Item
}

interface Props {
  navigation: any
}

const ChooseOrganizationContainer = ({ navigation }: Props) => {
  const { Layout, Colors, Fonts } = useTheme()
  console.log(store.getState().authReducer.allOrganizations.length)
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

  const organizations = store.getState().authReducer.allOrganizations
  const selectedOrg = store.getState().authReducer.selectedOrg

  const animatedValue = useRef(new Animated.Value(0)).current
  const [animationIn, setAnimationIn] = useState<boolean>(false)

  const handleSelectOrg = (org: any) => {
    const current = getOrgByOrgId(organizations, org)
    store.dispatch(setSelectedOrg(current))
    console.log(current)
    setAnimationIn(false)
  }

  const hideModal = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.elastic(1.2),
    }).start()
  }

  const showModal = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.elastic(1.2),
    }).start()
  }

  useEffect(() => {
    if (animationIn) {
      hideModal()
    } else {
      showModal()
    }
  }, [animationIn])

  useEffect(() => {
    store.dispatch(setSelectedOrg({ name: '', orgId: '' }))
  }, [])

  const handleRedirect = () => {
    navigation.navigate(PASSWORD_SCREEN)
  }

  return (
    <View style={Layout.fill}>
      <View flex center style={{ borderColor: Colors.GREEN_DARK }}>
        <Picker
          mode={Picker.modes.SINGLE}
          value={selectedOrg?.orgId}
          migrateTextField
          migrate
          onPress={() => setAnimationIn(true)}
          renderItem={(value, itemProps, label) => {
            const { isSelected } = itemProps
            const currentOrg = getOrgByOrgId(organizations, value)
            return (
              <View key={label}>
                <View
                  style={{
                    ...styles.orgOption,
                    width: screenWidth - 70,
                  }}
                >
                  <View style={{ width: screenWidth / 20 }}>
                    {isSelected ? (
                      <SelectedOptionIcon />
                    ) : (
                      <NotSelectedOptionIcon />
                    )}
                  </View>
                  <View style={{ width: screenWidth / 1.5 }}>
                    <Text
                      style={
                        isSelected
                          ? {
                              ...styles.selectedOptionText,
                              color: Colors.GREEN_DARK,
                            }
                          : styles.optionText
                      }
                    >
                      {label}
                    </Text>
                    <Text
                      style={{ ...styles.optionText, color: Colors.GREEN_DARK }}
                    >
                      {currentOrg?.name}
                    </Text>
                  </View>
                  <View>
                    <NewLabel />
                  </View>
                </View>
                <View
                  style={{
                    borderBottomColor: Colors.GRAY,
                    height: 1,
                    marginVertical: 10,
                    opacity: 0.5,
                    borderBottomWidth: 1,
                  }}
                />
              </View>
            )
          }}
          renderCustomModal={({ visible, children, toggleModal }) => {
            return (
              <Modal
                visible={visible}
                presentationStyle="overFullScreen"
                style={styles.modalView}
                animationType="slide"
                transparent
              >
                <Animated.View
                  style={{
                    height: screenHeight - 270,
                    width: screenWidth,
                    ...styles.modalView,
                    transform: [
                      {
                        translateY: animatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 300],
                        }),
                      },
                    ],
                  }}
                >
                  <Text
                    style={{
                      ...styles.modalTitle,
                      ...Fonts.textRegular,
                      fontFamily: 'Montserrat-SemiBold',
                      color: Colors.GREEN_MAIN,
                    }}
                  >
                    Choose Organization
                  </Text>

                  <FlatList
                    data={organizations}
                    renderItem={(org: Org): ReactElement => (
                      <Picker.Item
                        key={org.item.orgId}
                        value={org.item.orgId}
                        label={org.item.name}
                        disabled={false}
                      />
                    )}
                  />
                </Animated.View>
              </Modal>
            )
          }}
          onChange={org => handleSelectOrg(org)}
          renderPicker={() => (
            <View
              style={
                selectedOrg?.name
                  ? {
                      ...styles.pickerBox,
                      borderColor: Colors.GREEN_MAIN,
                    }
                  : styles.pickerBox
              }
            >
              <Text
                style={
                  selectedOrg?.name
                    ? {
                        ...styles.pickerLabel,
                        color: Colors.GREEN_MAIN,
                      }
                    : {
                        ...Fonts.textRegular,
                        ...styles.pickerLabel,
                      }
                }
                center
              >
                {selectedOrg?.name || 'Choose Organization'}
              </Text>
              <PickerIcon style={styles.pickerIcon} width={20} />
            </View>
          )}
        ></Picker>
        <ButtonCustom
          disabled={!selectedOrg?.name.length}
          action={handleRedirect}
          label="Next"
          color={Colors.GREEN_DARK}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  orgOption: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerBox: {
    width: 300,
    borderWidth: 2,
    marginHorizontal: 60,
    padding: 13,
    borderRadius: 8,
  },
  pickerIcon: {
    position: 'absolute',
    right: 10,
    top: 19,
  },
  pickerLabel: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
  },
  modalView: {
    backgroundColor: 'white',
    borderTopEndRadius: 20,
    borderTopLeftRadius: 20,
    shadowColor: '#000',
    position: 'absolute',
    bottom: 0,
  },
  selectedOptionText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    fontWeight: '700',
  },
  optionText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    fontWeight: '400',
  },
  modalTitle: {
    alignSelf: 'center',
    top: -30,
    fontSize: 18,
  },
})

export default ChooseOrganizationContainer
