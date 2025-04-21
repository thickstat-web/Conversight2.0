const presets = ['module:metro-react-native-babel-preset']
const plugins = [] // 'transform-remove-console'

plugins.push([
  'module-resolver',
  {
    root: ['./src'],
    extensions: ['.js', '.json'],
    alias: {
      '@': './src',
    },
  },
])

// Reanimated plugin has to be listed last.
// Ref: https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation/
plugins.push('react-native-reanimated/plugin')

module.exports = {
  presets,
  plugins,
}
