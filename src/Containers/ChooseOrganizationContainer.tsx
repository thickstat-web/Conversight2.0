import React, { ReactElement, useRef, useEffect, useState } from 'react'
import { View, Text, Picker, Modal } from 'react-native-ui-lib'
import {
  FlatList,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme, useAppDispatch, useAppSelector } from '@/Hooks'
import { Brand, Button } from '@/Components'
import { selectAllOrganizations, selectSignInOrg } from '@/Store/Auth'
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
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
  const { t } = useTranslation()
  const { Gutters, Layout, Colors, Fonts } = useTheme()
  const dispatch = useAppDispatch()
  const organizations = useAppSelector(selectAllOrganizations)
  const selectedOrg = useAppSelector(selectSignInOrg)

  const animatedValue = useRef(new Animated.Value(0)).current
  const [animationIn, setAnimationIn] = useState<boolean>(false)

  const handleSelectOrg = (org: any) => {
    const current = getOrgByOrgId(organizations, org)
    dispatch(setSelectedOrg(current))
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
    dispatch(setSelectedOrg({ name: '', orgId: '' }))
  }, [])

  const handleRedirect = () => {
    navigation.navigate(PASSWORD_SCREEN)
  }

  return (
    <View flex>
      <View flex-4 center>
        <Brand width={'60%'} />
      </View>
      <View flex-6 centerH marginT-20>
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
                      style={[
                        styles.optionText,
                        isSelected && styles.selectedOption,
                        isSelected && { color: Colors.GREEN_DARK },
                      ]}
                    >
                      {label}
                    </Text>
                    <Text
                      style={[styles.optionText, { color: Colors.GREEN_DARK }]}
                    >
                      {currentOrg?.name}
                    </Text>
                  </View>
                  <View>
                    <NewLabel />
                  </View>
                </View>
                <View
                  style={[
                    styles.orgNameSeparator,
                    { borderBottomColor: Colors.GRAY },
                  ]}
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
                  style={[
                    styles.modalView,
                    {
                      height: screenHeight - (screenHeight * 42) / 100,
                      width: screenWidth,
                      transform: [
                        {
                          translateY: animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 100],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text
                    style={[
                      Fonts.textRegular,
                      styles.modalTitle,
                      { color: Colors.GREEN_MAIN },
                    ]}
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
          onChange={handleSelectOrg}
          renderPicker={() => (
            <View
              style={[
                styles.pickerBox,
                !!selectedOrg?.name && { borderColor: Colors.GREEN_MAIN },
              ]}
            >
              <Text
                style={[
                  Fonts.textRegular,
                  styles.pickerLabel,
                  !!selectedOrg?.name && { color: Colors.GREEN_MAIN },
                ]}
                center
              >
                {selectedOrg?.name || 'Choose Organization'}
              </Text>
              <PickerIcon style={styles.pickerIcon} width={20} />
            </View>
          )}
        />
        <View marginT-16 width={300}>
          <Button
            dark={true}
            block={true}
            label={t('common.buttons.next')}
            disabled={!selectedOrg?.name.length}
            onPress={handleRedirect}
          />
        </View>
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
  orgNameSeparator: {
    height: 1,
    marginVertical: 10,
    opacity: 0.5,
    borderBottomWidth: 1,
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
  optionText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    fontWeight: '400',
  },
  selectedOption: {
    fontWeight: '700',
  },
  modalTitle: {
    fontFamily: 'Montserrat-SemiBold',
    alignSelf: 'center',
    top: -40,
    fontSize: 18,
  },
})

export default ChooseOrganizationContainer
