import { getSystemName, getSystemVersion } from 'react-native-device-info'

const env = {
  STAGING: {
    CS_API_HOST: 'api.staging.conversight.ai',
    BOT_API_HOST: 'bot.staging.conversight.ai',
    INGRESS_API_HOST: 'ingress.staging.conversight.ai',
  },
  PRODUCTION: {
    CS_API_HOST: 'api.conversight.ai',
    BOT_API_HOST: 'bot.conversight.ai',
    INGRESS_API_HOST: 'ingress.conversight.ai',
  },
}

/**
 * Sets the target environment based on the build type (Debug or Release Build)
 */
export const { CS_API_HOST, BOT_API_HOST, INGRESS_API_HOST } = __DEV__
  ? env.STAGING
  : env.PRODUCTION

export const Config = {
  CS_API_HOST,
  BOT_API_HOST,
  INGRESS_API_HOST,
}

export const setCustomHosts = (
  apiHost: string,
  botHost: string,
  ingressHost: string,
) => {
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

export const DEFAULT_ADAPTIVE_CARD_ROWS = 5
export const NO_DATA_AVAILABLE = 'No data available'
export const MY_DASHBOARD = 'my dashboard'
export const ATHENA = 'athena'
export const SHARED = 'shared'
export const VIEW_ALL = 'view all'
export const EXPAND = 'Expand'
export const COLLAPSE = 'Collapse'
export const EXPAND_ALL = 'Expand All'
export const COLLAPSE_ALL = 'Collapse All'
