import React, { ReactNode, useState } from 'react'
import { View, Text, Picker, PickerValue } from 'react-native-ui-lib'
import { Modal, StyleSheet, FlatList } from 'react-native'
import { formatDistance } from 'date-fns'
import { useTheme, useAppDispatch, useAppSelector } from '@/Hooks'
import { SearchBar } from '@/Components'
import { setSelectedDatasetId, selectDatasetId } from '@/Store/Auth'
import RadioIcon from '@/Assets/Images/iconsSVG/radio.svg'
import RadioSelectedIcon from '@/Assets/Images/iconsSVG/radio-selected.svg'
import DatasetIcon from '@/Assets/Images/iconsSVG/dataset.svg'
import CloseIcon from '@/Assets/Images/iconsSVG/close.svg'
import IconButton from '@/Components/IconButton'
import { useGetDatasetsQuery } from '@/Services/modules/chat'
import { Dataset } from '@/Types/Dataset'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DEFAULT_DATASET_SHOW_COUNT } from '@/Config'

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

type SearchDatasetListProps = {
  modalTitle: string
  toggleModal: (show: boolean) => void
  dataSets: Dataset[]
}

const SearchDatasetList = ({
  modalTitle: MODAL_TITLE,
  toggleModal,
  dataSets,
}: SearchDatasetListProps) => {
  const insets = useSafeAreaInsets()
  const { Colors } = useTheme()
  const [searchText, setSearchText] = useState('')

  const filterBySearchText = (dataset: Dataset) => {
    return dataset.datasetName
      .toLowerCase()
      .includes(searchText.trim().toLowerCase())
  }

  const filteredDataSet = searchText.trim().length
    ? dataSets.filter(filterBySearchText)
    : dataSets
  const showSearchBox = dataSets.length >= DEFAULT_DATASET_SHOW_COUNT

  return (
    <View
      flex
      style={{
        marginTop: insets.top,
        backgroundColor: Colors.WHITE,
      }}
    >
      <Header title={MODAL_TITLE} onClose={() => toggleModal(false)} />
      {showSearchBox && (
        <View
          style={{
            paddingBottom: 8,
            backgroundColor: Colors.GREEN_MAIN,
          }}
        >
          <SearchBar
            searchText={searchText}
            setSearchText={setSearchText}
            placeholderText={'Search datasets...'}
            selectionColor={Colors.GREEN_LIGHT}
            placeholderTextColor={Colors.GREEN_LIGHTEST}
            cursorColor={Colors.WHITE}
            textColor={Colors.WHITE}
            iconColor={Colors.WHITE}
            style={{
              marginHorizontal: 16,
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderColor: 'green',
            }}
          />
        </View>
      )}
      <FlatList
        data={filteredDataSet}
        renderItem={({ item: dataset, index }) => (
          <Picker.Item
            key={`${dataset.dataSetID}-${index}`}
            value={dataset.dataSetID}
            label={dataset.datasetName}
          />
        )}
        keyExtractor={(item, index) => `${item.dataSetID}-${index}`}
        extraData={searchText}
      />
    </View>
  )
}

type PickerItemProps = {
  label: string
  timeAgo: string
  isSelected: boolean
}

const PickerItem = React.memo(
  ({ label, timeAgo, isSelected }: PickerItemProps) => {
    const { Colors, Fonts } = useTheme()
    const backgroundColor = isSelected ? Colors.NOTIFICATION_GREEN : Colors.GRAY

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
          <Text marginT-8>Last updated {timeAgo}</Text>
        </View>
        {isSelected ? <RadioSelectedIcon /> : <RadioIcon />}
      </View>
    )
  },
)

const DatasetChooser = ({ onSelect }: Props) => {
  const DATA_SET_CHOOSER_COUNTER = 'Choose Dataset'
  const dispatch = useAppDispatch()
  const { Colors } = useTheme()
  const { data, isLoading } = useGetDatasetsQuery()
  const dataSets = data?.data || []
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
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => toggleModal(false)}
        style={[styles.container, { backgroundColor: Colors.GREEN_MAIN }]}
      >
        <SearchDatasetList
          modalTitle={DATA_SET_CHOOSER_COUNTER}
          toggleModal={toggleModal}
          dataSets={dataSets}
        />
      </Modal>
    )
  }

  const renderCustomPickerItem = (
    value: PickerValue,
    { isSelected }: PickerItemProps & PickerProps,
    label: string,
  ) => {
    const dataset = dataSets.find(ds => ds.dataSetID === value)
    const timeAgo = formatDistance(
      new Date(dataset?.republishCompletedTime ?? new Date()),
      new Date(),
      {
        addSuffix: true,
      },
    )
    return (
      <PickerItem label={label} timeAgo={timeAgo} isSelected={isSelected} />
    )
  }

  const renderCustomPicker = () => (
    <IconButton
      icon={<DatasetIcon />}
      loading={isLoading}
      loaderColor={Colors.GREEN_MAIN}
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
  container: {
    flex: 1,
  },
  orgOption: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
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

export default React.memo(DatasetChooser)
