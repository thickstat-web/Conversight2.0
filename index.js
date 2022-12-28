/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native'
import App from './src/App'
import { name as appName } from './app.json'

LogBox.ignoreLogs(['Require cycle: node_modules/victory'])
LogBox.ignoreAllLogs(true) //ignore all logs
AppRegistry.registerComponent(appName, () => App)
