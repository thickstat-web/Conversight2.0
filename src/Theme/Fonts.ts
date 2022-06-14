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
      fontFamily:  "Montserrat-Medium",
      fontSize: FontSize.small,
      color: Colors.GREEN_DARK,
      lineHeight: 20,
    },
    textSmallContrast: {
      fontFamily:  "Montserrat-Medium",
      fontSize: FontSize.small,
      color: Colors.WHITE,
      lineHeight: 20,
    },
    textRegular: {
      fontFamily:  "Montserrat-Medium",
      fontSize: FontSize.regular,
      color: Colors.GREEN_DARK,
      lineHeight: 20,
    },
    textNormalContrast: {
      fontFamily:  "Montserrat-Medium",
      fontSize: FontSize.regular,
      color: Colors.WHITE,
      lineHeight: 20,
    },
    textRegularBold: {
      fontFamily: 'Montserrat-SemiBold',
      fontSize: FontSize.regular,
      lineHeight: 20,
    },
    text20Bold: {
      fontFamily: 'Montserrat-SemiBold',
      fontSize: 20,
      lineHeight: 20,
    },
    text18BoldContrast: {
      fontFamily: 'Montserrat-SemiBold',
      fontSize: FontSize.regular,
      lineHeight: 20,
      color: Colors.WHITE,
    },
    text18Contrast: {
      fontFamily:  "Montserrat-Medium",
      fontSize: FontSize.regular,
      lineHeight: 20,
      color: Colors.WHITE,
    },
    text15Bold: {
      fontFamily: 'Montserrat-SemiBold',
      fontSize: 15,
      lineHeight: 20,
    },
    textBoldContrast: {
      fontSize: FontSize.regular,
      fontWeight: 'bold',
      color: Colors.WHITE,
      lineHeight: 20,
    },
    textLarge: {
      fontFamily:  "Montserrat-Medium",
      fontSize: FontSize.large,
      color: Colors.GREEN_DARK,
    },
    titleSmall: {
      fontFamily:  "Montserrat-Medium",
      fontSize: FontSize.small * 2,
      fontWeight: 'bold',
      color: Colors.GREEN_DARK,
    },
    titleRegular: {
      fontFamily:  "Montserrat-Medium",
      fontSize: FontSize.regular * 2,
      fontWeight: 'bold',
      color: Colors.GREEN_DARK,
    },
    titleLarge: {
      fontFamily:  "Montserrat-Medium",
      fontSize: FontSize.large * 2,
      fontWeight: 'bold',
      color: Colors.GREEN_DARK,
    },
    textCenter: {
      fontFamily:  "Montserrat-Medium",
      textAlign: 'center',
    },
    textJustify: {
      fontFamily:  "Montserrat-Medium",
      textAlign: 'justify',
    },
    textLeft: {
      fontFamily:  "Montserrat-Medium",
      textAlign: 'left',
    },
    textRight: {
      fontFamily:  "Montserrat-Medium",
      textAlign: 'right',
    },
    textPrimary: {
      color: Colors.primary,
    },
    textDarkPrimary: {
      color: Colors.GREEN_DARK,
    },
    textContrast: {
      color: Colors.WHITE,
    },
  })
}
