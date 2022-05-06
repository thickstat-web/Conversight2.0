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
      fontFamily: 'Montserrat-Regular',
      fontSize: FontSize.small,
      color: Colors.GREEN_DARK,
    },
    textRegular: {
      fontFamily: 'Montserrat-Regular',
      fontSize: FontSize.regular,
      color: Colors.GREEN_DARK,
    },
    textLarge: {
      fontFamily: 'Montserrat-Regular',
      fontSize: FontSize.large,
      color: Colors.GREEN_DARK,
    },
    titleSmall: {
      fontFamily: 'Montserrat-Regular',
      fontSize: FontSize.small * 2,
      fontWeight: 'bold',
      color: Colors.GREEN_DARK,
    },
    titleRegular: {
      fontFamily: 'Montserrat-Regular',
      fontSize: FontSize.regular * 2,
      fontWeight: 'bold',
      color: Colors.GREEN_DARK,
    },
    titleLarge: {
      fontFamily: 'Montserrat-Regular',
      fontSize: FontSize.large * 2,
      fontWeight: 'bold',
      color: Colors.GREEN_DARK,
    },
    textCenter: {
      fontFamily: 'Montserrat-Regular',
      textAlign: 'center',
    },
    textJustify: {
      fontFamily: 'Montserrat-Regular',
      textAlign: 'justify',
    },
    textLeft: {
      fontFamily: 'Montserrat-Regular',
      textAlign: 'left',
    },
    textRight: {
      fontFamily: 'Montserrat-Regular',
      textAlign: 'right',
    },
  })
}
