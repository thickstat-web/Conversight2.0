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
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useHeaderHeight } from '@react-navigation/elements'
import { useTheme, useAppDispatch, useOrganization } from '@/Hooks'
import { Brand, LayoutNoInternet } from '@/Components'
import { setPassword } from '@/Store/Auth'
import PickerIcon from '@/Assets/Images/iconsSVG/pickerIcon.svg'
import SelectedOptionIcon from '@/Assets/Images/iconsSVG/selectedOptionArrow.svg'
import NotSelectedOptionIcon from '@/Assets/Images/iconsSVG/notSelectedOptionArrow.svg'
import NewLabel from '@/Assets/Images/iconsSVG/newLabel.svg'
import OrgPassword from './OrgPassword'
import { Org } from '@/Types/VerifyEmailResponse'

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
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
  const { Colors, Fonts } = useTheme()
  const { organizations, signInOrg, setSignInOrgId, isSingleOrg } =
    useOrganization()
  const headerHeight = useHeaderHeight()
  const dispatch = useAppDispatch()
  const [openModal, setOpenModal] = useState(false)
  const openModalAnim = useRef(new Animated.Value(0)).current

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

  const handleSelectOrg = (orgId: string) => {
    setSignInOrgId(orgId)
    dispatch(setPassword(''))
    hideModal()
  }

  const renderCustomPickerModal = ({
    visible,
    toggleModal,
  }: RenderCustomModalProps) => {
    const animationStyles = {
      height: (screenHeight * 56) / 100,
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

    const renderItem = ({
      item: { orgId, name },
    }: {
      item: Org
    }): ReactElement => (
      <Picker.Item key={orgId} value={orgId} label={name} disabled={false} />
    )
    return (
      <Modal
        visible={isSingleOrg ? false : visible}
        presentationStyle="overFullScreen"
        style={styles.modalView}
        animationType="slide"
        transparent
        onBackgroundPress={() => {
          hideModal()
          toggleModal(false)
        }}
        onRequestClose={() => {
          hideModal()
          toggleModal(false)
        }}
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

          <FlatList data={organizations} renderItem={renderItem} />
        </Animated.View>
      </Modal>
    )
  }

  const renderCustomPicker = () => (
    <View
      style={[
        styles.pickerBox,
        !!signInOrg?.name
          ? { borderColor: Colors.GREEN_MAIN }
          : { borderColor: Colors.GREEN_DARK },
      ]}
    >
      <Text
        center
        style={[
          Fonts.textRegular,
          styles.pickerLabel,
          !!signInOrg?.name && { color: Colors.GREEN_MAIN },
        ]}
      >
        {signInOrg?.name || MODAL_TITLE}
      </Text>
      {!isSingleOrg && <PickerIcon style={styles.pickerIcon} width={20} />}
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
            {/* <Text style={[styles.optionText, { color: Colors.GREEN_DARK }]}>
              {signInOrg?.name}
            </Text> */}
          </View>
          {/*<View> <NewLabel /> </View>*/}
        </View>
        <View
          style={[styles.orgNameSeparator, { borderBottomColor: Colors.GRAY }]}
        />
      </View>
    )
  }

  return (
    <LayoutNoInternet>
      <ScrollView
        keyboardShouldPersistTaps={'always'}
        showsVerticalScrollIndicator={false}
      >
        <View marginB-25>
          <View center>
            <Brand height={290} width={'60%'} />
          </View>
          <View center>
            <Picker
              mode={Picker.modes.SINGLE}
              value={signInOrg?.orgId}
              migrateTextField
              migrate
              onPress={showModal}
              onChange={handleSelectOrg}
              renderPicker={renderCustomPicker}
              renderCustomModal={renderCustomPickerModal}
              renderItem={renderCustomPickerItem}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={headerHeight}
            >
              <OrgPassword navigation={navigation} />
            </KeyboardAvoidingView>
          </View>
        </View>
      </ScrollView>
    </LayoutNoInternet>
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
    opacity: 0.8,
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
    paddingVertical: 8,
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
