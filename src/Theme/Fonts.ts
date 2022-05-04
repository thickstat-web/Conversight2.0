/**
 * This file contains all application's style relative to fonts
 */
import { StyleSheet } from 'react-native'
import { ThemeVariables, ThemeFonts } from '@/Theme/theme.type'

/**
 *
 * @param Theme can be spread like {Colors, NavigationColors, Gutters, Layout, Common, ...args}
 * @return {*}
 */
export default function ({ FontSize, Colors }: ThemeVariables): ThemeFonts {
  return StyleSheet.create({
    textSmall: {
      fontSize: FontSize.small,
      color: Colors.text,
    },
    textNormal: {
      fontSize: FontSize.normal,
      color: Colors.text,
    },
    textNormalContrast: {
      fontSize: FontSize.normal,
      color: Colors.white,
    },
    textBold: {
      fontSize: FontSize.normal,
      fontWeight: 'bold',
      lineHeight: 20,
    },
    textBoldContrast: {
      fontSize: FontSize.normal,
      fontWeight: 'bold',
      color: Colors.white,
      lineHeight: 20,
    },
    textLarge: {
      fontSize: FontSize.large,
      color: Colors.text,
    },
    titleSmall: {
      fontSize: FontSize.small * 2,
      fontWeight: 'bold',
      color: Colors.text,
    },
    titleRegular: {
      fontSize: FontSize.normal * 2,
      fontWeight: 'bold',
      color: Colors.text,
    },
    titleLarge: {
      fontSize: FontSize.large * 2,
      fontWeight: 'bold',
      color: Colors.text,
    },
    textCenter: {
      textAlign: 'center',
    },
    textJustify: {
      textAlign: 'justify',
    },
    textLeft: {
      textAlign: 'left',
    },
    textRight: {
      textAlign: 'right',
    },
    textPrimary: {
      color: Colors.primary,
    },
    textDarkPrimary: {
      color: Colors.darkPrimary,
    },
    textContrast: {
      color: Colors.white,
    },
  })
}
