import React, { useEffect, useRef } from 'react'
import { Keyboard, StyleSheet, TextInput } from 'react-native'
import { View } from 'react-native-ui-lib'
// import { useTranslation } from 'react-i18next'
import { useTheme } from '@/Hooks'
import BackIcon from '@/Assets/Images/iconsSVG/back.svg'
import SearchIcon from '@/Assets/Images/iconsSVG/search.svg'
import IconButton from '@/Components/IconButton'

declare type SearchBarProps = {
  onCancel: () => void
}

function SearchBar({ onCancel }: SearchBarProps): JSX.Element {
  const { Gutters, Layout, Colors, Common, Fonts } = useTheme()
  const searchRef = useRef<TextInput>(null)

  useEffect(() => {
    if (searchRef?.current) {
      searchRef?.current?.focus()
    }
  }, [searchRef])

  const cancelSearch = () => {
    Keyboard.dismiss()
    onCancel()
  }

  return (
    <View
      style={[
        styles.searchbarWrapper,
        {
          backgroundColor: Colors.GREEN_MAIN,
        },
      ]}
    >
      <IconButton
        icon={<BackIcon />}
        style={styles.cancelIcon}
        onPress={cancelSearch}
      />
      <View flexG style={styles.searchInputWrapper}>
        <TextInput
          ref={searchRef}
          placeholder="Search chat..."
          placeholderTextColor={'rgba(255, 255, 255, 0.75)'}
          selectionColor={'rgba(255, 255, 255, 0.5)'}
          focusable={true}
          clearButtonMode={'always'}
          style={[Fonts.textNormalContrast, styles.searchInput]}
        />
      </View>
      <IconButton icon={<SearchIcon />} style={styles.searchIcon} />
    </View>
  )
}

const styles = StyleSheet.create({
  searchbarWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  cancelIcon: {
    margin: 0,
    paddingTop: 8,
    paddingRight: 9,
    backgroundColor: 'transparent',
  },
  searchInputWrapper: {
    borderRadius: 8,
    left: -5,
  },
  searchInput: {
    top: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingLeft: 8,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchIcon: {
    margin: 0,
    paddingTop: 12,
    paddingRight: 2,
    paddingBottom: 4,
    backgroundColor: 'transparent',
  },
})

export default SearchBar
