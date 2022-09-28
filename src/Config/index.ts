import { getSystemName, getSystemVersion } from 'react-native-device-info'
export const CS_API_HOST = 'api.conversight.ai'
export const BOT_API_HOST = 'bot.conversight.ai'
export const INGRESS_API_HOST = 'ingress.conversight.ai'

export const Config = {
  CS_API_HOST,
  BOT_API_HOST,
  INGRESS_API_HOST,
}

export const setCustomHosts = (apiHost: string, botHost: string, ingressHost: string) => {
  Config.CS_API_HOST = apiHost
  Config.BOT_API_HOST = botHost
  Config.INGRESS_API_HOST = ingressHost
}

export const setDefaultHosts = () => {
  Config.CS_API_HOST = CS_API_HOST
  Config.BOT_API_HOST = BOT_API_HOST
  Config.INGRESS_API_HOST = INGRESS_API_HOST
}

export const getAPIUrl = () => `${Config.CS_API_HOST}`
export const getBotUrl = () => `${Config.BOT_API_HOST}/v2`
export const getIngressUrl = () => `${Config.INGRESS_API_HOST}`

export const DEFAULT_EMAIL = ''
export const DEFAULT_PASSWORD = ''
export const DEVICE_NAME = `${getSystemName()} v${getSystemVersion()}`

export const NO_DATA_AVAILABLE = 'No data available'
export const MY_DASHBOARD = 'my dashboard'
export const ATHENA = 'athena'
export const SHARED = 'shared'
export const VIEW_ALL = 'view all'