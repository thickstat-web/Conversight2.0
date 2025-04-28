import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';
import FilterEditContent from './FilterEditContent';

const Filter: React.FC<any> = ({ columnItem, removeItemFn, addFilterItem, setLoading }) => {
  const [item, setItem] = useState<any>({});


  useEffect(() => {
    setItem({ ...columnItem });
  }, [columnItem]);

  const FilterItemSelectedValues = (params: any) => {
    addFilterItem(item.processedID, {
      operatorValue: params.operatorValue,
      inputValue: params.inputValue,
      dateValue: params.dateValue,
      dateValueTo: params.dateValueTo,
      flagValue: params.flagValue,
      btnLabel: params.btnLabel,
      isSingleValue: params.isSingleValue,
      isDisable: item.isDisable,
      dateValues: params.dateValues,
      globalFilter: params.globalFilter,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FilterEditContent columnItem={columnItem} onClose={removeItemFn} FilterItemSelectedValues={FilterItemSelectedValues} setLoading={setLoading} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey60,
    paddingVertical: 12,
  },
  picker: {
    borderWidth: 1,
    borderColor: Colors.grey50,
    borderRadius: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  chip: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: Colors.grey70,
    borderColor: Colors.grey50,
  },
  editPanel: {
    padding: 16,
    backgroundColor: Colors.grey70,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.grey50,
    borderRadius: 8,
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: Colors.grey50,
    borderRadius: 8,
    padding: 12,
  },
});

export default Filter;