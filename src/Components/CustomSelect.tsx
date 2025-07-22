import React, { useState, useMemo, useEffect } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Keyboard,
  Animated,
  Easing,
} from 'react-native'
import { Text, Button } from 'react-native-ui-lib'
import Icon from 'react-native-vector-icons/Ionicons'
import { useTheme } from '@/Hooks'

interface Option {
  label: string
  value: string
}

interface CustomSelectProps {
  mode: 'SINGLE' | 'MULTI'
  options: Option[]
  value: string | string[]
  onChange: (val: string[]) => void
  placeholder?: string
  placeholderTextColor?: string
  style?: any
  loading?: boolean
  showSearch?: boolean
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  mode,
  options,
  value,
  onChange,
  placeholder = 'Select items...',
  placeholderTextColor,
  style,
  loading,
  showSearch = true,
}) => {
  const { Colors } = useTheme()

  const THEME = {
    primary: Colors.GREEN_MAIN,
    primaryLight: Colors.GREEN_LIGHT,
    secondary: Colors.GREEN_DARK,
    background: Colors.WHITE,
    text: Colors.TEXT_DEFAULT,
    placeholder: Colors.GRAY_DARK,
    border: Colors.GREEN_LIGHT,
    divider: Colors.GREEN_LIGHT,
    icon: Colors.GREEN_MAIN,
    button: Colors.GREEN_MAIN,
    buttonText: Colors.WHITE,
    selected: Colors.GRAY_LIGHT,
    selectedText: Colors.GREEN_DARK,
  }

  const effectivePlaceholderTextColor = placeholderTextColor || THEME.placeholder

  const [visible, setVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const spinValue = useMemo(() => new Animated.Value(0), [])

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start()
    } else {
      spinValue.setValue(0)
    }
  }, [loading, spinValue])

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const isMulti = mode === 'MULTI'

  useEffect(() => {
    if (!isMulti && Array.isArray(value) && value.length > 1) {
      onChange(value.length ? [value[0]] : [])
    }
  }, [mode])

  const selected: string[] = useMemo(() => {
    return Array.isArray(value) ? value : value ? [value] : []
  }, [value])

  const filteredOptions = useMemo(() => {
    if (!searchText) return options
    return options.filter(opt =>
      opt.label.toLowerCase().includes(searchText.toLowerCase()),
    )
  }, [searchText, options])

  const handleToggle = (item: Option) => {
    if (isMulti) {
      const updated = selected.includes(item.value)
        ? selected.filter(v => v !== item.value)
        : [...selected, item.value]
      onChange(updated)
    } else {
      onChange([item.value])
      setVisible(false)
    }
  }

  const displayText = useMemo(() => {
    if (!selected.length) return placeholder

    const selectedLabels = options
      .filter(opt => selected.includes(opt.value))
      .map(opt => opt.label)

    return isMulti
      ? `${selected?.length} selected`
      : selectedLabels[0] || placeholder
  }, [selected, options, placeholder, isMulti])

  const renderItem = ({ item }: { item: Option }) => {
    const isSelected = selected.includes(item.value)

    return (
      <TouchableOpacity
        onPress={() => handleToggle(item)}
        style={[  
          styles.itemContainer,
          isSelected && {
            backgroundColor: Colors.GRAY_LIGHT,
            borderLeftWidth: 3,
            borderLeftColor: Colors.GREEN_DARK,
          },
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.checkboxContainer}>
          {isMulti ? (
            <View
              style={[
                styles.checkbox,
                isSelected && {
                  backgroundColor: Colors.green20,
                  borderColor: Colors.green5,
                },
              ]}
            >
              {isSelected && (
                <Icon name="checkmark" size={16} color={THEME.primary} />
              )}
            </View>
          ) : (
            <View style={styles.radioContainer}>
              <View
                style={[
                  styles.radioOuter,
                  isSelected && { borderColor: THEME.primary },
                ]}
              >
                {isSelected && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: THEME.primary },
                    ]}
                  />
                )}
              </View>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.itemLabel,
             { color: THEME.selectedText, fontWeight: '600' },
          ]}
        >
          {item?.label?.trim()}
        </Text>

        {isSelected && !isMulti && (
          <Icon name="checkmark" size={20} color={THEME.primary} />
        )}
      </TouchableOpacity>
    )
  }

  const styles = StyleSheet.create({
    container: {
      marginVertical: 8,
      zIndex: 10,
    },
    selector: {
      padding: 14,
      borderWidth: 0.6,
      borderRadius: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    selectorText: {
      flex: 1,
      fontSize: 16,
      marginRight: 10,
    },
    selectorIcons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    badge: {
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginRight: 8,
    },
    badgeText: {
      color: THEME.buttonText,
      fontSize: 12,
      fontWeight: 'bold',
    },
    dropdown: {
      borderWidth: 0.6,
      borderRadius: 10,
      marginTop: 8,
      maxHeight: 350,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      flexGrow: 0,
    },
    list: {
      flexGrow: 1,
      flexShrink: 1,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderBottomWidth: 1,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 8,
    },
    clearButton: {
      padding: 4,
      marginLeft: 8,
    },

    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderColor: THEME.divider
    },
    checkboxContainer: {
      marginRight: 12,
      borderColor: THEME.primary,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: THEME.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioContainer: {
      width: 22,
      height: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioOuter: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: THEME.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderColor: THEME.primary,
      color: THEME.primary,
    },
    itemLabel: {
      flex: 1,
      fontSize: 16,
      color: THEME.text,
    },
    emptyContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      marginTop: 8,
      color: THEME.placeholder,
      fontSize: 16,
    },
    footer: {
      padding: 25,
      paddingBottom: 20,
    },
    button: {
      borderRadius: 8,
      height: 48,
    },
    buttonLabel: {
      color: THEME.buttonText,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonIcon: {
      marginRight: 8,
      color: THEME.buttonText,
    },
    loadingIcon: {
      marginBottom: 10,
    },
  })

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.selector,
          {
            borderColor: visible ? THEME.primary : THEME.border,
            backgroundColor: THEME.background,
          },
        ]}
        onPress={() => {
          Keyboard.dismiss()
          setVisible(!visible)
        }}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.selectorText,
            {
              color: 'black',
            },
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Text>

        <View style={styles.selectorIcons}>
          {selected?.length > 0 && isMulti && (
            <View style={[styles.badge, { backgroundColor: THEME.primary }]}>
              <Text style={styles.badgeText}>{selected.length}</Text>
            </View>
          )}
          <Icon
            name={visible ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={THEME.icon}
          />
        </View>
      </TouchableOpacity>

      {visible && (
        <View
          style={[
            styles.dropdown,
            {
              borderColor: THEME.primary,
              backgroundColor: THEME.background,
              shadowColor: THEME.text,
            },
          ]}
        >
          {showSearch && (
            <View
              style={[
                styles.searchContainer,
                { borderBottomColor: THEME.divider },
              ]}
            >
              <Icon
                name="search"
                size={18}
                color={THEME.placeholder}
                style={styles.searchIcon}
              />
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    color: THEME.text,
                  },
                ]}
                placeholder="Search..."
                placeholderTextColor={effectivePlaceholderTextColor}
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText ? (
                <TouchableOpacity
                  onPress={() => setSearchText('')}
                  style={styles.clearButton}
                >
                  <Icon name="close-circle" size={18} color={THEME.placeholder} />
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          <FlatList
            data={filteredOptions}
            keyExtractor={item => item.value}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                {loading ? (
                  <>
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Icon
                        name="refresh-outline"
                        size={40}
                        color={THEME.primary}
                        style={styles.loadingIcon}
                      />
                    </Animated.View>
                    <Text style={[styles.emptyText, { color: THEME.primary }]}>
                      Loading options...
                    </Text>
                  </>
                ) : (
                  <>
                    <Icon
                      name="search-outline"
                      size={40}
                      color={THEME.placeholder}
                    />
                    <Text style={styles.emptyText}>No options found</Text>
                  </>
                )}
              </View>
            }
          />

          <View style={[styles.footer, { borderTopColor: THEME.divider }]}>
            <Button
              label="Done"
              onPress={() => setVisible(false)}
              backgroundColor={THEME.button}
              labelStyle={styles.buttonLabel}
              style={styles.button}
              iconSource={() => (
                <Icon
                  name="checkmark-done"
                  size={20}
                  color={THEME.buttonText}
                  style={styles.buttonIcon}
                />
              )}
            />
          </View>
        </View>
      )}
    </View>
  )
}

CustomSelect.defaultProps = {
  placeholder: 'Select items...',
  placeholderTextColor: undefined,
  style: {},
  loading: false,
}

export default CustomSelect
