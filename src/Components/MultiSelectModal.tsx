import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  SafeAreaView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from 'react-native-ui-lib';

interface MultiSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onDone: (selectedItems: string[]) => void;
  options: Array<{ value: string; label: string }>;
  selectedItems: string[];
  onToggleItem: (item: string) => void;
  onClearAll: () => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  operatorValue?: string;
}

const MultiSelectModal: React.FC<MultiSelectModalProps> = ({
  visible,
  onClose,
  onDone,
  options,
  selectedItems,
  onToggleItem,
  onClearAll,
  searchQuery,
  onSearchChange,
  operatorValue = 'is'
}) => {
  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter(option => 
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, options]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Filter Options</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
              <Icon name="close-circle" size={20} color={Colors.RED} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.operatorSection}>
            <Text style={styles.sectionLabel}>Operator</Text>
            <View style={styles.operatorDisplay}>
              <Text style={styles.operatorText}>{operatorValue}</Text>
              <Icon name="chevron-down" size={16} color={Colors.GREEN_DARK} />
            </View>
          </View>
          
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Icon name="search" size={20} color={Colors.GREEN_DARK} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={onSearchChange}
                placeholderTextColor={Colors.BLACK}
              />
            </View>
          </View>
          
          <ScrollView style={styles.optionsContainer}>
            {filteredOptions.map((option) => {
              const isSelected = selectedItems.includes(option.value);
              return (
                <TouchableOpacity 
                  key={option.value} 
                  style={styles.optionItem}
                  onPress={() => onToggleItem(option.value)}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Icon name="checkmark" size={16} color={Colors.WHITE} />}
                  </View>
                  <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={onClearAll}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => onDone(selectedItems)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.GREEN_DARK,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.RED,
    marginRight: 4,
    fontSize: 14,
  },
  operatorSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.grey30,
    marginBottom: 8,
  },
  operatorDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.green10,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.white,
  },
  operatorText: {
    fontSize: 16,
    color: Colors.green1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.green10,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.white,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
    color: Colors.BLACK,
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.green10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.green10,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.GREEN_DARK,
    borderColor: Colors.GREEN_DARK,
  },
  optionText: {
    fontSize: 16,
    color: Colors.BLACK,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  clearButton: {
    borderWidth: 1,
    borderColor: Colors.GREEN_DARK,
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: Colors.GREEN_DARK,
    fontSize: 16,
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: Colors.GREEN_DARK,
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MultiSelectModal;
