import React from 'react'
import { FlatList, StyleSheet, Text } from 'react-native'
import { View } from 'react-native-ui-lib'
import Icon from 'react-native-vector-icons/Ionicons'
import { useTheme } from '@/Hooks'
import { DateValue, Filter, FilterValue } from '@/Types/Pinboard'
import { properCase } from '@/Utils/common'
import { Colors } from '@/Theme/Variables'
import { LayoutNoInternet } from '@/Components'
import { useNetInfo } from '@react-native-community/netinfo'

export type DasboardFilter = {
  type: string
  columnId: string
  columnName: string
  operator: string
  value: string
}

const dateValueMapper = (value: DateValue) =>
  `${value.dateValueFrom} - ${value.dateValueTo}`

const valueMapper = (value: FilterValue) => `${value.name}`

function buildFilterValues(value: string | FilterValue[]): string {
  return Array.isArray(value)
    ? value.length === 0
      ? 'all'
      : value.map(valueMapper).join(', ')
    : value
}
const filterMapper = (filter: Filter) => {
  let generatedFilter: DasboardFilter | null = null
  if (filter.category === 'dateFilter') {
    const { value, dateFrom, dateTo } = filter
    generatedFilter = {
      type: 'globalDateFilter',
      columnId: '',
      columnName: 'Report Period',
      operator: value !== 'between' ? 'is' : '',
      value:
        value === 'between'
          ? `between ${dateFrom} - ${dateTo}`
          : Array.isArray(value)
          ? 'All Dates'
          : value,
    }
  } else if (filter.category === 'date') {
    const { category, column, resolvedColumn, operator, dateValues, value } =
      filter
    generatedFilter = {
      type: category,
      columnId: column,
      columnName: resolvedColumn,
      operator: dateValues && dateValues.length > 0 ? 'between' : operator,
      value:
        dateValues && dateValues.length > 0
          ? dateValues.map(dateValueMapper).join(' AND ')
          : (value as string),
    }
  } else if (filter.category === 'dimensions') {
    const { category, column, resolvedColumn, operator, value } = filter
    generatedFilter = {
      type: category,
      columnId: column,
      columnName: resolvedColumn,
      operator: operator === '' ? 'is' : operator,
      value: buildFilterValues(value),
    }
  } else if (filter.category === 'calculated dimension') {
    const { category, column, resolvedColumn, operator, value } = filter
    generatedFilter = {
      type: category,
      columnId: column,
      columnName: resolvedColumn,
      operator: operator === '' ? 'is' : operator,
      value: buildFilterValues(value),
    }
  }
  return generatedFilter
}

export const buildDashboardFilters = (
  appliedFilters: Filter[],
): DasboardFilter[] => {
  const nullFilter = (filter: DasboardFilter | null) => filter !== null
  return appliedFilters.map(filterMapper).filter(nullFilter) as DasboardFilter[]
}

type DashboardFiltersProps = {
  filters: DasboardFilter[]
}

export const DashboardFilters = ({ filters }: DashboardFiltersProps) => {
  const { Fonts } = useTheme()

  const renderFilter = ({ item: filter }: { item: DasboardFilter }) => {
    return (
      <View row margin-2 marginH-6 style={styles.filter}>
        <View style={styles.icon}>
          <Icon
            name="checkmark-circle-outline"
            size={18}
            color={Colors.WHITE}
          />
        </View>
        <Text style={[Fonts.textSmall, styles.font14]}>
          {properCase(filter.columnName)}
        </Text>
        <View>
          <Text style={[Fonts.textSmall, styles.filterValue]}>
            {filter.operator} {filter.value}
          </Text>
        </View>
      </View>
    )
  }
  const { isConnected } = useNetInfo()
  return (
    <View>
      <View>
        {!isConnected && (
          <View style={{ height: 30 }}>
            <LayoutNoInternet />
          </View>
        )}
      </View>
      <View
        paddingT-8
        paddingB-8
        paddingH-16
        style={{ backgroundColor: Colors.WHITE }}
      >
        <FlatList
          data={filters}
          showsHorizontalScrollIndicator={false}
          horizontal
          keyExtractor={item => `${item.columnId}-${item.columnName}`}
          renderItem={renderFilter}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  icon: {
    marginHorizontal: 6,
    backgroundColor: Colors.GREEN_MAIN,
    borderRadius: 25,
  },
  filter: {
    alignItems: 'center',
    backgroundColor: Colors.GREEN_LIGHTEST,
    paddingRight: 10,
    paddingVertical: 6,
    borderRadius: 16,

    /* For box shadow */
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,

    elevation: 2,
  },
  font14: {
    fontSize: 14,
  },
  filterValue: {
    marginLeft: 4,
    color: Colors.GREEN_MAIN,
    fontSize: 14,
  },
})
