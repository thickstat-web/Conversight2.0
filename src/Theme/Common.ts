/**
 * This file defines the base application styles.
 *
 * Use it to define generic component styles (e.g. the default text styles, default button styles...).
 */
import { StyleSheet } from 'react-native'
import buttonStyles from './components/Buttons'
import { ThemeCommonParams } from '@/Theme/theme.type'
/**
 *
 * @param Theme can be spread like {Colors, NavigationColors, Gutters, Layout, Common, ...args}
 * @return {*}
 */
export default function ({ Colors, ...args }: ThemeCommonParams) {
  return {
    button: buttonStyles({ Colors, ...args }),
    ...StyleSheet.create({
      backgroundPrimary: {
        backgroundColor: Colors.GREEN_MAIN,
      },
      backgroundDarkPrimary: {
        backgroundColor: Colors.GREEN_DARK,
      },
      backgroundReset: {
        backgroundColor: Colors.transparent,
      },
      textInput: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 18,
        minWidth: 300,
        maxWidth: 300,
        borderWidth: 2,
        borderColor: Colors.GREEN_DARK,
        backgroundColor: Colors.WHITE,
        color: Colors.GREEN_DARK,
        // minHeight: 50,
        textAlign: 'center',
        borderRadius: 8,
        paddingRight: 36,
        paddingLeft: 8,
        paddingVertical: 10,
        // paddingRight: 15,
        // paddingEnd: 35,
        // paddingStart: 35,
      },
      inputIcon: {
        position: 'absolute',
        right: 15,
      },
      inputBox: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      },
      curved: {
        borderRadius: 8,
      },
    }),
  }
}
