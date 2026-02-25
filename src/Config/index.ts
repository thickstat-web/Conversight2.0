import { getSystemName, getSystemVersion } from 'react-native-device-info'

export const env = {
  STAGING: {
    CS_API_HOST: 'api-gcp.staging.conversight.ai',
    BOT_API_HOST: 'bot-gcp.staging.conversight.ai',
    INGRESS_API_HOST: 'ingress-gcp.staging.conversight.ai',
    CLIENT_DATA_KEY: {
      client_id: 'cs-7F3A1D9B4C6E2F8A5B1D7C9E3A2F6Ba',
      client_secret: '9C6D4A1F8B3E7D2C5A9F1B4E6C3D8A',
    },
  },
  PRE_PROD: {
    CS_API_HOST: 'api.preprod.conversight.ai',
    BOT_API_HOST: 'bot.preprod.conversight.ai',
    INGRESS_API_HOST: 'ingress.preprod.conversight.ai',
    CLIENT_DATA_KEY: {
      client_id: 'cs-7F3A1D9B4C6E2F8A5B1D7C9E3A2F6Ba',
      client_secret: '9C6D4A1F8B3E7D2C5A9F1B4E6C3D8A',
    },
  },
  PRODUCTION: {
    CS_API_HOST: 'api.conversight.ai',
    BOT_API_HOST: 'bot.conversight.ai',
    INGRESS_API_HOST: 'ingress.conversight.ai',
    CLIENT_DATA_KEY: {
      client_id: 'cs-A8C4F2D7B1E9G6H3K5L7M2N8P4R1S9',
      client_secret: 'F3B9E1C6D4A7H2K8M5N9P3R6S1T7L2',
    },
  },
}

/**
 * Sets the target environment based on the build type (Debug or Release Build)
 */
export const { CS_API_HOST, BOT_API_HOST, INGRESS_API_HOST, CLIENT_DATA_KEY } =
  __DEV__ ? env.PRE_PROD : env.PRE_PROD

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
export const DEFAULT_TABLE_RENDER_ROWS = 5
export const DEFAULT_DATASET_SHOW_COUNT = 6
export const DEFAULT_DASHBOARD_SHOW_COUNT = 4
export const NO_DATA_AVAILABLE = 'There is no data available'
export const MY_DASHBOARD = 'my storyboard'
export const ATHENA = 'athena'
export const SHARED = 'shared'
export const VIEW_ALL = 'view all'
export const EXPAND = 'Expand'
export const COLLAPSE = 'Collapse'
export const EXPAND_ALL = 'Expand All'
export const COLLAPSE_ALL = 'Collapse All'
export const RESET_PREVIEWER = 'Reset Previewer'

