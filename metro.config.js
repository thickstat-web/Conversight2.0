/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const { getDefaultConfig } = require('metro-config')

module.exports = async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig()

  return {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json', 'svg', 'png', 'gif', 'jpg'],
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      // Add module resolution for DatePickerIOS
      extraNodeModules: {
        // This redirects DatePickerIOS imports to our mock file
        'react-native/Libraries/Components/DatePicker/DatePickerIOS': require.resolve('./src/Utils/DatePickerIOSMock.js'),
      },
    },
  }
}
