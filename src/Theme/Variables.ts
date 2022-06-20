/**
 * This file contains the application's variables.
 *
 * Define color, sizes, etc. here instead of duplicating them throughout the components.
 * That allows to change them more easily later on.
 */

import {
  ThemeColors,
  ThemeFontSize,
  ThemeMetricsSizes,
  ThemeNavigationColors,
} from '@/Theme/theme.type'

/**
 * Colors
 */
export const Colors: ThemeColors = {
  // Example colors:
  GREEN_LIGHTER: '#27DC61',
  GREEN_LIGHT: '#00DA49',
  GREEN_MAIN: '#00AA39',
  GREEN_DARK: '#014E40',
  LIGHT_BLUE: '#00C1FA',
  DARK_BLUE: '#0097C4',
  ORANGE_LIGHT: '#FFCD4B',
  ORANGE_DARK: '#FF6F14',
  PURPLE: '#7A7AF7',
  WHITE: '#FFFFFF',
  RED: '#F06F5F',
  GRAY: '#F2F2F3',
  DARK: '#004438',
  NOTIFICATION_BGR: '#E0F0E5',
}

export const NavigationColors: Partial<ThemeNavigationColors> = {
  primary: Colors.primary,
}

/**
 * FontSize
 */
export const FontSize: ThemeFontSize = {
  small: 16,
  regular: 18,
  large: 40,
}

/**
 * Metrics Sizes
 */
const tiny = 5 // 10
const small = tiny * 2 // 10
const regular = tiny * 3 // 15
const large = regular * 2 // 30

export const MetricsSizes: ThemeMetricsSizes = {
  tiny,
  small,
  regular,
  large,
}

export default {
  Colors,
  NavigationColors,
  FontSize,
  MetricsSizes,
}
