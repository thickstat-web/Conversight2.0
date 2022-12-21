import React from 'react'
import { Pressable, StyleSheet, TextInput, View, ViewStyle } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

type SearchBarProps = {
  searchText: string
  setSearchText: (text: string) => void
  placeholderTextColor: string
  placeholderText: string
  selectionColor: string
  cursorColor: string
  textColor: string
  iconColor: string
  style: ViewStyle
}

const SearchBar = ({
  searchText,
  setSearchText,
  placeholderTextColor,
  placeholderText,
  selectionColor,
  cursorColor,
  textColor,
  iconColor,
  style,
}: SearchBarProps) => {
  return (
    <View style={[styles.container, style]}>
      <Icon style={styles.icon} name="ios-search" size={20} color={iconColor} />
      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholderTextColor={placeholderTextColor}
        placeholder={placeholderText}
        value={searchText}
        selectionColor={selectionColor}
        cursorColor={cursorColor}
        onChangeText={setSearchText}
      />
      <Pressable onPress={() => setSearchText('')}>
        <Icon style={styles.icon} name="close" size={20} color={iconColor} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderColor: 'black',
    borderWidth: 1,
  },
  icon: {
    padding: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
})

export default SearchBar
