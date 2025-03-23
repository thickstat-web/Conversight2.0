import React, {
  ReactElement,
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { View, Text, Picker, Modal, Avatar } from 'react-native-ui-lib'
import {
  FlatList,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme, useAppDispatch, useAppSelector } from '@/Hooks'
import {
  selectAllOrganizations,
  selectAuthData,
  selectSelectedOrg,
  selectTempOrg,
  setTempOrg,
} from '@/Store/Auth'
import PickerIcon from '@/Assets/Images/iconsSVG/pickerIcon.svg'
import SelectedOptionIcon from '@/Assets/Images/iconsSVG/selectedOptionArrow.svg'
import NotSelectedOptionIcon from '@/Assets/Images/iconsSVG/notSelectedOptionArrow.svg'
import NewLabel from '@/Assets/Images/iconsSVG/newLabel.svg'
import { getOrgByOrgId } from '@/Utils/array'
import { CHANGE_ORGANIZATION_PASSWORD } from '@/Constants/screens'
import DownArrow from '@/Assets/Images/drawer/down-arrow.svg'
import EnterPassword from './EnterPassword'

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

const ChangeOrganizationContainer = ({ navigation }: Props) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
  const { t } = useTranslation()
  const { Colors, Fonts } = useTheme()
  const dispatch = useAppDispatch()
  const organizations = useAppSelector(selectAllOrganizations)
  const selectedOrg = useAppSelector(selectSelectedOrg)
  const authData = useAppSelector(selectAuthData)
  const tempOrg = useAppSelector(selectTempOrg)
  const animatedValue = useRef(new Animated.Value(0)).current
  const [openModal, setOpenModal] = useState(false)

  useEffect(() => {
    dispatch(setTempOrg(selectedOrg))
  }, [])

  const toggleModal = useCallback(
    (toValue = 0) => {
      Animated.timing(animatedValue, {
        toValue,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.elastic(1.2),
      }).start()
    },
    [animatedValue],
  )

  useEffect(() => {
    toggleModal(openModal ? 0 : 1)
  }, [openModal, toggleModal])

  const showModal = () => setOpenModal(true)

  const hideModal = () => setOpenModal(false)

  const handleSelectOrg = (org: any) => {
    const current = getOrgByOrgId(organizations, org)
    dispatch(setTempOrg(current))
    hideModal()
  }

  const renderItem = (value: string, itemProps: { isSelected: any }, label: React.Key | null | undefined) => {
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
            {isSelected ? <SelectedOptionIcon /> : <NotSelectedOptionIcon />}
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
            <Text style={[styles.optionText, { color: Colors.GREEN_DARK }]}>
              {currentOrg?.name}
            </Text>
          </View>
          <View>
            <NewLabel />
          </View>
        </View>
        <View
          style={[styles.orgNameSeparator, { borderBottomColor: Colors.GRAY }]}
        />
      </View>
    )
  }

  const renderCustomModal = ({
    visible,
    children,
    toggleModal,
  }: {
    visible: boolean
    toggleModal: (show: boolean) => void
    onSearchChange: (searchValue: string) => void
    children: React.ReactNode
    onDone: () => void
    onCancel: () => void
  }): JSX.Element => {
    const renderItem = (org: Org): ReactElement => (
      <Picker.Item
        key={org.item.orgId}
        value={org.item.orgId}
        label={org.item.name}
        disabled={false}
      />
    )

    return (
      <Modal
        visible={visible}
        presentationStyle="overFullScreen"
        style={styles.modalView}
        animationType="slide"
        transparent
        onBackgroundPress={() => {
          hideModal()
          toggleModal(false)
        }}
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
            {/* Choose Organization */}
          </Text>

          <FlatList data={organizations} renderItem={renderItem} />
        </Animated.View>
      </Modal>
    )
  }

  const renderPicker = () => (
    <View
      style={[
        styles.pickerBox,
        !!tempOrg?.name && { borderColor: Colors.GREEN_MAIN },
      ]}
    >
      <Text
        style={[
          Fonts.textRegular,
          styles.pickerLabel,
          !!tempOrg?.name && { color: Colors.GREEN_MAIN },
        ]}
        center
      >
        {tempOrg?.name || 'Choose Organization'}
      </Text>
      <PickerIcon style={styles.pickerIcon} width={20} />
    </View>
  )
  return (
    <View flex>
      <View flex-4 center>
        <Avatar size={100} />
        <Text
          marginT-20
          style={{ ...Fonts.text20Bold, color: Colors.GREEN_DARK }}
        >
          {authData?.displayName}
        </Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text color={Colors.GREEN_MAIN}>{tempOrg.name}</Text>
          <DownArrow style={{ marginLeft: 5 }} />
        </View>
      </View>
      <View flex-6 centerH marginT-20>
        <Picker
          mode={Picker.modes.SINGLE}
          value={tempOrg?.orgId}
          migrateTextField
          migrate
          onPress={showModal}
          renderItem={renderItem}
          renderCustomModal={renderCustomModal}
          onChange={handleSelectOrg}
          renderPicker={renderPicker}
        />
        <EnterPassword navigation={navigation} />
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

export default ChangeOrganizationContainer
