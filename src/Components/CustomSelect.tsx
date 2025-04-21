import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Text, Colors, Checkbox, Button } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/Ionicons';

const THEME_COLORS = {
  primary: Colors.GREEN_MAIN,
  secondary: Colors.GREEN_DARK,
  background: Colors.WHITE,
  text: Colors.GREEN_DARK,
  placeholder: Colors.GRAY_DARK,
  border: Colors.GREEN_DARK,
  divider: Colors.GREEN_DARK,
  icon: Colors.GREEN_MAIN,
  button: Colors.GREEN_MAIN,
  buttonText: Colors.WHITE,
};

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  mode: 'SINGLE' | 'MULTI';
  options: Option[];
  value: string | string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  placeholderTextColor?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  mode,
  options,
  value,
  onChange,
  placeholder = 'Select item',
  placeholderTextColor = THEME_COLORS.placeholder,
}) => {
  const [visible, setVisible] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [searchText, setSearchText] = useState('');

  const isMulti = mode === 'MULTI';

  const selected: string[] = useMemo(() => {
    return Array.isArray(value) ? value : value ? [value] : [];
  }, [value]);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, options]);

  const handleToggle = (item: Option) => {
    if (isMulti) {
      const updated = selected.includes(item.value)
        ? selected.filter((v) => v !== item.value)
        : [...selected, item.value];
      onChange(updated);
    } else {
      onChange([item.value]);
      setVisible(false);
    }
  };

  const handleAdd = () => {
    const val = newItem.trim();
    if (!val) return;

    const exists = options.some((o) => o.value === val);
    if (!exists) {
      const newOption: Option = { value: val, label: val };
      options.push(newOption);
    }

    if (isMulti) {
      onChange([...selected, val]);
    } else {
      onChange([val]);
    }

    setNewItem('');
    setSearchText('');
  };

  const displayText = useMemo(() => {
    const selectedLabels = options
      .filter((opt) => selected.includes(opt.value))
      .map((opt) => opt.label);
    return selectedLabels.length ? selectedLabels.join(', ') : placeholder;
  }, [selected, options, placeholder]);

  const renderItem = ({ item }: { item: Option }) => {
    const isChecked = selected.includes(item.value);

    return (
      <TouchableOpacity
        onPress={() => handleToggle(item)}
        style={[
          styles.itemRow,
          { backgroundColor: THEME_COLORS.background }
        ]}
      >
        {isMulti ? (
          <Checkbox
            label={item.label}
            value={isChecked}
            onValueChange={() => handleToggle(item)}
            color={THEME_COLORS.primary}
            labelStyle={{ color: THEME_COLORS.text }}
          />
        ) : (
          <Text style={{ color: THEME_COLORS.text }}>{item.label}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.selector,
          { 
            borderColor: THEME_COLORS.border,
            backgroundColor: THEME_COLORS.background
          }
        ]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.selectorText,
          { 
            color: selected.length ? THEME_COLORS.text : THEME_COLORS.placeholder 
          }
        ]}>
          {displayText}
        </Text>
        <Icon 
          name={visible ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={THEME_COLORS.icon} 
          style={styles.chevron}
        />
      </TouchableOpacity>

      {visible && (
        <View style={[
          styles.dropdown,
          { 
            borderColor: THEME_COLORS.border,
            backgroundColor: THEME_COLORS.background,
            shadowColor: THEME_COLORS.border
          }
        ]}>
          <TextInput
            style={[
              styles.input,
              { 
                borderColor: THEME_COLORS.border,
                color: THEME_COLORS.text
              }
            ]}
            placeholder="Search..."
            placeholderTextColor={placeholderTextColor}
            value={searchText}
            onChangeText={setSearchText}
          />

          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.value}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
          />

          <View style={[
            styles.divider,
            { backgroundColor: THEME_COLORS.divider }
          ]} />

          <View style={styles.addRow}>
            <TextInput
              style={[
                styles.input,
                { 
                  borderColor: THEME_COLORS.border,
                  color: THEME_COLORS.text
                }
              ]}
              placeholder="Add item"
              placeholderTextColor={placeholderTextColor}
              value={newItem}
              onChangeText={setNewItem}
              onSubmitEditing={handleAdd}
            />
            <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
              <Icon name="add-circle-outline" size={24} color={THEME_COLORS.icon} />
            </TouchableOpacity>
          </View>

          <Button 
            label="Done" 
            onPress={() => setVisible(false)} 
            backgroundColor={THEME_COLORS.button}
            labelStyle={{ color: THEME_COLORS.buttonText }}
            style={styles.doneButton}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  selector: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    flex: 1,
  },
  chevron: {
    marginLeft: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 400,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 8,
  },
  list: {
    maxHeight: 200,
  },
  itemRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    marginVertical: 8,
    opacity: 0.3,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  addButton: {
    marginLeft: 8,
  },
  doneButton: {
    margin: 10,
    borderRadius: 6,
  },
});

export default CustomSelect;