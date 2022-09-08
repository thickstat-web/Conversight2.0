import React, { ReactNode } from 'react'
import {
  View,
  Text,
  Picker,
  PickerValue,
  Modal,
  PickerItemProps,
} from 'react-native-ui-lib'
import { StyleSheet, ScrollView, FlatList, Pressable } from 'react-native'
// import { useTranslation } from 'react-i18next'
import { useTheme, useFaq } from '@/Hooks'
import CloseIcon from '@/Assets/Images/iconsSVG/close.svg'
import FaqIcon from '@/Assets/Images/iconsSVG/faq.svg'
import IconButton from '@/Components/IconButton'
import { Colors } from '@/Theme/Variables'

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
  const VIEW_ALL = 'View All'
  // const { t } = useTranslation()
  const { Colors, Fonts, Layout } = useTheme()
  const {
    tagQuestionsMap,
    tags,
    questions,
    isLoading,
    filterTags,
    setFilterTags,
  } = useFaq()
  const tagList = [VIEW_ALL, ...tags]
  // console.log(`[FaqPicker] filterTags: ${filterTags}`)

  const handleSelectedFaq = (value: PickerValue) => {
    const faq = value?.toString()
    if (faq) {
      onSelect(faq)
    }
  }

  const handleFilterTag = (item: string) => {
    if (item === VIEW_ALL) {
      setFilterTags([])
    } else {
      setFilterTags(prev => {
        return prev.includes(item)
          ? prev.filter(tag => tag !== item)
          : [...prev, item]
      })
    }
  }

  const renderTag = ({ item }: { item: string }) => {
    if (!tagQuestionsMap) {
      return null
    }

    const handleTagSelect = () => {
      handleFilterTag(item)
    }

    const renderCount = () => {
      if (!tagQuestionsMap[item]) {
        return ''
      }

      const count = tagQuestionsMap[item].length
      return <Text style={styles.tagText}> ({count})</Text>
    }

    const selected =
      (filterTags.length === 0 && item === VIEW_ALL) ||
      filterTags.includes(item)

    return (
      <Pressable
        onPress={handleTagSelect}
        style={[styles.tag, selected && styles.selectedTagWrapper]}
      >
        <Text style={[Fonts.textSmall, selected && { color: Colors.WHITE }]}>
          {item}
          {renderCount()}
        </Text>
      </Pressable>
    )
  }

  const renderCustomPickerModal = ({
    visible,
    toggleModal,
  }: RenderCustomModalProps) => {
    const closeModal = () => toggleModal(false)
    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View flex style={{ backgroundColor: Colors.GRAY_LIGHT }}>
          <Header title={MODAL_TITLE} onClose={closeModal} />
          <View
            paddingV-8
            paddingH-16
            style={{ backgroundColor: Colors.WHITE }}
          >
            <FlatList
              data={tagList}
              // contentContainerStyle={{ backgroundColor: 'orange' }}
              showsHorizontalScrollIndicator={false}
              horizontal
              keyExtractor={(_, index) => `${index}`}
              renderItem={renderTag}
            />
          </View>
          <ScrollView
            style={[Layout.fill]}
            contentContainerStyle={{ paddingTop: 16 }}
          >
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
    const backgroundColor = isSelected ? Colors.NOTIFICATION_GREEN : Colors.GRAY
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
        icon={<FaqIcon />}
        loading={isLoading}
        loaderColor={Colors.GREEN_MAIN}
        style={[styles.faqButton, { backgroundColor: Colors.GRAY }]}
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
  faqButton: {
    marginRight: 0,
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
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
  },
  tagText: { color: Colors.GRAY_DARK, paddingLeft: 8 },
  selectedTagWrapper: {
    backgroundColor: Colors.GREEN_DARK,
    borderRadius: 8,
  },
  selectedTagText: {
    color: Colors.WHITE,
  },
})

export default FAQPicker
