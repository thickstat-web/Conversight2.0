import React, { useEffect, useState, ReactNode } from 'react'
import {
  View,
  Text,
  Picker,
  PickerValue,
  Modal,
  PickerItemProps,
} from 'react-native-ui-lib'
import { StyleSheet, ScrollView } from 'react-native'
import { formatDistance } from 'date-fns'

// import { useTranslation } from 'react-i18next'
import { useTheme, useAppDispatch, useAppSelector } from '@/Hooks'
import { setSelectedDatasetId, selectDatasetId } from '@/Store/Auth'
import RadioIcon from '@/Assets/Images/iconsSVG/radio.svg'
import RadioSelectedIcon from '@/Assets/Images/iconsSVG/radio-selected.svg'
import DatasetIcon from '@/Assets/Images/iconsSVG/dataset.svg'
import CloseIcon from '@/Assets/Images/iconsSVG/close.svg'
import IconButton from '@/Components/IconButton'
import { useGetDatasetsQuery } from '@/Services/modules/chat'
import { Dataset } from '@/Types/Dataset'

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

const DatasetChooser = ({ onSelect }: Props) => {
  const MODAL_TITLE = 'Choose Dataset'
  // const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { Colors, Fonts, Layout } = useTheme()
  const { data } = useGetDatasetsQuery()
  const datasets = data?.data || []
  const selectedDatasetId = useAppSelector(selectDatasetId)

  const handleSelectedDataset = (value: PickerValue) => {
    const datasetId = value?.toString()
    if (datasetId) {
      dispatch(setSelectedDatasetId(datasetId))
      onSelect(datasetId)
    }
  }

  const renderCustomPickerModal = ({
    visible,
    toggleModal,
  }: RenderCustomModalProps) => {
    return (
      <Modal visible={visible} animationType="slide">
        <View flex style={{ backgroundColor: Colors.WHITE }}>
          <View
            row
            centerV
            paddingV-6
            style={{ backgroundColor: Colors.GREEN_MAIN }}
          >
            <View flex center>
              <Text
                style={[Fonts.textRegularBold, { color: Colors.WHITE }]}
                numberOfLines={1}
              >
                {MODAL_TITLE}
              </Text>
            </View>
            <IconButton
              icon={<CloseIcon />}
              style={styles.closeIcon}
              onPress={() => toggleModal(false)}
            />
          </View>
          <ScrollView style={[Layout.fill]}>
            {datasets.map((dataset: Dataset, index) => (
              <Picker.Item
                key={`${dataset.dataSetID}-${index}`}
                value={dataset.dataSetID}
                label={dataset.datasetName}
              />
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
    const dataset = datasets.find(ds => ds.dataSetID === value)
    const timeAgo = formatDistance(
      new Date(dataset?.updatedTime ?? new Date()),
      new Date(),
      {
        addSuffix: true,
      },
    )
    const backgroundColor = isSelected ? Colors.NOTIFICATION_BGR : Colors.GRAY
    return (
      <View
        key={label}
        row
        style={[
          styles.item,
          {
            backgroundColor,
          },
        ]}
      >
        <View flex>
          <Text
            style={[
              Fonts.textRegularBold,
              styles.optionLabel,
              {
                color: Colors.GREEN_DARK,
              },
            ]}
          >
            {label}
          </Text>
          <Text marginT-8>Last Update: {timeAgo}</Text>
        </View>
        <View>{isSelected ? <RadioSelectedIcon /> : <RadioIcon />}</View>
      </View>
    )
  }

  const renderCustomPicker = () => (
    <IconButton
      icon={<DatasetIcon />}
      style={{ backgroundColor: Colors.GRAY }}
    />
  )

  return (
    <Picker
      value={selectedDatasetId || ''}
      mode={Picker.modes.SINGLE}
      migrateTextField
      migrate
      onChange={handleSelectedDataset}
      renderPicker={renderCustomPicker}
      renderCustomModal={renderCustomPickerModal}
      renderItem={renderCustomPickerItem}
    />
  )
}

const styles = StyleSheet.create({
  orgOption: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeIcon: {
    right: 16,
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
    marginVertical: 12,
    marginHorizontal: 16,
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  optionLabel: {
    marginRight: 12,
  },
  selectedOption: {
    marginRight: 12,
  },
})

export default DatasetChooser
