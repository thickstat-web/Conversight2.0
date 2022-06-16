import React, {
  ReactElement,
  useRef,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react'
import {
  View,
  Text,
  Picker,
  PickerValue,
  PickerItemProps,
  Modal,
} from 'react-native-ui-lib'
import {
  FlatList,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native'
import { useTheme, useAppDispatch, useAppSelector } from '@/Hooks'
import { Brand, Button } from '@/Components'
import { selectAllOrganizations, selectSignInOrg } from '@/Store/Auth'
import PickerIcon from '@/Assets/Images/iconsSVG/pickerIcon.svg'
import SelectedOptionIcon from '@/Assets/Images/iconsSVG/selectedOptionArrow.svg'
import NotSelectedOptionIcon from '@/Assets/Images/iconsSVG/notSelectedOptionArrow.svg'
import NewLabel from '@/Assets/Images/iconsSVG/newLabel.svg'
import { getOrgByOrgId } from '@/Utils/array'
import { setSelectedOrg } from '@/Store/Auth'
import OrgPassword from './OrgPassword'
import { ScrollView } from 'react-native-gesture-handler'

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

declare type RenderCustomModalProps = {
  visible: boolean
  toggleModal: (show: boolean) => void
  onSearchChange: (searchValue: string) => void
  children: ReactNode
  onDone: () => void
  onCancel: () => void
}

const ChooseOrganizationContainer = ({ navigation }: Props) => {
  const MODAL_TITLE = 'Choose Organization'
  const ORG_INIT_STATE = { name: '', orgId: '' }
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
  const { Colors, Fonts } = useTheme()
  const dispatch = useAppDispatch()
  const organizations = useAppSelector(selectAllOrganizations)
  const selectedOrg = useAppSelector(selectSignInOrg)
  const [openModal, setOpenModal] = useState(false)
  const openModalAnim = useRef(new Animated.Value(0)).current

  const singleOrg = organizations.length === 1

  const toggleModal = useCallback(
    (toValue = 0) => {
      Animated.timing(openModalAnim, {
        toValue,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.elastic(1.2),
      }).start()
    },
    [openModalAnim],
  )

  useEffect(() => {
    toggleModal(openModal ? 0 : 1)
  }, [openModal, toggleModal])

  const showModal = () => setOpenModal(true)

  const hideModal = () => setOpenModal(false)

  useEffect(() => {
    if (singleOrg) {
      dispatch(setSelectedOrg(organizations[0]))
    } else {
      dispatch(setSelectedOrg(ORG_INIT_STATE))
    }
  }, [])

  const handleSelectOrg = (org: any) => {
    const current = getOrgByOrgId(organizations, org)
    dispatch(setSelectedOrg(current))
    hideModal()
  }

  const renderCustomPickerModal = ({ visible, toggleModal }: RenderCustomModalProps) => {
    const animationStyles = {
      height: (screenHeight * 58) / 100,
      width: screenWidth,
      transform: [
        {
          translateY: openModalAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 100],
          }),
        },
      ],
    }

    return (
      <Modal
        visible={singleOrg ? false : visible}
        presentationStyle="overFullScreen"
        style={styles.modalView}
        animationType="slide"
        transparent
        onBackgroundPress={() => { hideModal(); toggleModal(false) }}
      >
        <Animated.View style={[styles.modalView, animationStyles]}>
          <Text
            style={[
              Fonts.textRegular,
              styles.modalTitle,
              { color: Colors.GREEN_MAIN },
            ]}
          >
            {MODAL_TITLE}
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
  }

  const renderCustomPicker = () => (
    <View
      style={[
        styles.pickerBox,
        !!selectedOrg?.name
          ? { borderColor: Colors.GREEN_MAIN }
          : { borderColor: Colors.GREEN_DARK }
      ]}
    >
      <Text
        center
        style={[
          Fonts.textRegular,
          styles.pickerLabel,
          !!selectedOrg?.name && { color: Colors.GREEN_MAIN },
        ]}
      >
        {selectedOrg?.name || MODAL_TITLE}
      </Text>
      {!singleOrg && <PickerIcon style={styles.pickerIcon} width={20} />}

    </View>
  )

  const renderCustomPickerItem = (
    value: PickerValue,
    props: PickerItemProps & {
      isSelected: boolean
    },
    label: string,
  ) => {
    const { isSelected } = props
    const currentOrg = getOrgByOrgId(organizations, value)
    return (
      <View key={label}>
        <View
          style={[
            styles.orgOption,
            {
              width: screenWidth - 70,
            },
          ]}
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

  return (
    <ScrollView>

      <View marginB-25 >
        <View center>
          <Brand height={290} width={'60%'} />
        </View>
        <View center  >
          <Picker
            mode={Picker.modes.SINGLE}
            value={selectedOrg?.orgId}
            migrateTextField
            migrate
            onPress={showModal}
            onChange={handleSelectOrg}
            renderPicker={renderCustomPicker}
            renderCustomModal={renderCustomPickerModal}
            renderItem={renderCustomPickerItem}
          />
          <OrgPassword navigation={navigation} />
        </View>
      </View>
    </ScrollView>
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
