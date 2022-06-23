import React, { ReactNode, useState, useEffect } from 'react'
import {
  View,
  Text,
  Picker,
  PickerValue,
  Modal,
  PickerItemProps,
} from 'react-native-ui-lib'
import { StyleSheet, ScrollView } from 'react-native'
import _ from 'lodash'
// import { useTranslation } from 'react-i18next'
import { useTheme, useAppDispatch, useAppSelector } from '@/Hooks'
import { useGetFaqMutation } from '@/Services/modules/FAQ'
import { selectDatasetId } from '@/Store/Auth'
import { selectFAQ, setQuestions } from '@/Store/Faq'
import DatasetIcon from '@/Assets/Images/iconsSVG/dataset.svg'
import CloseIcon from '@/Assets/Images/iconsSVG/close.svg'
import IconButton from '@/Components/IconButton'
import { FaqRequestData } from '@/Types/Faq'

declare type RenderCustomModalProps = {
  visible: boolean
  toggleModal: (show: boolean) => void
  onSearchChange: (searchValue: string) => void
  children: ReactNode
  onDone: () => void
  onCancel: () => void
}

declare type Props = {
  onSelect: (datasetId: string) => void
}

declare type PickerProps = {
  isSelected: boolean
}

interface HeaderProps {
  title: string
  onClose: () => void
}

const Header = ({ title, onClose }: HeaderProps) => {
  const { Colors, Fonts } = useTheme()
  return (
    <View row centerV paddingV-6 style={{ backgroundColor: Colors.GREEN_MAIN }}>
      <IconButton
        icon={<CloseIcon />}
        style={styles.closeIcon}
        onPress={onClose}
      />
      <View flex center>
        <Text
          style={[Fonts.textRegularBold, { color: Colors.WHITE }]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
    </View>
  )
}

const FAQPicker = ({ onSelect }: Props) => {
  const MODAL_TITLE = 'Athena Recommendations'
  // const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { Colors, Fonts, Layout } = useTheme()
  const [getFaq, { data, isLoading, isSuccess, error }] = useGetFaqMutation()
  const selectedDatasetId = useAppSelector(selectDatasetId)
  const questions = useAppSelector(selectFAQ)

  useEffect(() => {
    if (selectedDatasetId) {
      const fetchFaq = async () => {
        const reqData: FaqRequestData = {
          dataset: [selectedDatasetId],
          isQuestionsOnly: true,
        }
        const resp = await getFaq(reqData).unwrap()
        dispatch(setQuestions(resp.data))
      }
      fetchFaq()
    }
  }, [dispatch, getFaq, selectedDatasetId])

  const handleSelectedFaq = (value: PickerValue) => {
    const faq = value?.toString()
    if (faq) {
      onSelect(faq)
    }
  }

  const renderCustomPickerModal = ({
    visible,
    toggleModal,
  }: RenderCustomModalProps) => {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={() => toggleModal(false)}
      >
        <View flex style={{ backgroundColor: Colors.WHITE }}>
          <Header title={MODAL_TITLE} onClose={() => toggleModal(false)} />
          <ScrollView style={[Layout.fill]}>
            {questions.map((item: string, index) => (
              <Picker.Item key={`${index}`} value={item} label={item} />
            ))}
          </ScrollView>
        </View>
      </Modal>
    )
  }

  const renderCustomPickerItem = (
    value: PickerValue,
    { isSelected }: PickerItemProps & PickerProps,
    label: string,
  ) => {
    const backgroundColor = isSelected ? Colors.NOTIFICATION_BGR : Colors.GRAY
    return (
      <View key={label} row style={[styles.item, { backgroundColor }]}>
        <View flex>
          <Text
            style={[
              Fonts.textSmall,
              styles.optionLabel,
              {
                color: Colors.GREEN_DARK,
              },
            ]}
          >
            {label}
          </Text>
        </View>
      </View>
    )
  }

  const renderCustomPicker = () => {
    return (
      <IconButton
        icon={<DatasetIcon />}
        loading={isLoading}
        style={{ backgroundColor: Colors.GRAY }}
      />
    )
  }

  return (
    <Picker
      value={`${''}`}
      mode={Picker.modes.SINGLE}
      migrateTextField
      migrate
      enableModalBlur={false}
      onChange={handleSelectedFaq}
      renderPicker={renderCustomPicker}
      renderItem={renderCustomPickerItem}
      renderCustomModal={renderCustomPickerModal}
    />
  )
}

const styles = StyleSheet.create({
  closeIcon: {
    left: 16,
    height: 32,
    width: 32,
  },
  itemSeparator: {
    height: 1,
    marginVertical: 10,
    opacity: 0.5,
    borderBottomWidth: 1,
  },
  item: {
    marginVertical: 2,
    marginHorizontal: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  optionLabel: {
    marginRight: 12,
  },
  selectedOption: {
    marginRight: 12,
  },
})

export default FAQPicker
