import { StyleSheet } from 'react-native'
import { ThemeCommonParams } from '@/Theme/theme.type'

export default function ({ Colors, Gutters, Layout }: ThemeCommonParams) {
  const base = {
    ...Layout.center,
    ...Gutters.largeHPadding,
    ...Gutters.regularVPadding,
    backgroundColor: Colors.primary,
  }
  const rounded = {
    ...base,
    borderRadius: 50,
  }
  const curved = {
    ...base,
    borderRadius: 8,
  }
  const block = {
    ...base,
    ...Layout.fill,
    ...Layout.row,
  }

  return StyleSheet.create({
    base,
    curved,
    rounded,
    block,
    outline: {
      ...base,
      backgroundColor: Colors.transparent,
      borderWidth: 2,
      borderColor: Colors.primary,
    },
    outlineRounded: {
      ...rounded,
      backgroundColor: Colors.transparent,
      borderWidth: 2,
      borderColor: Colors.primary,
    },
  })
}
