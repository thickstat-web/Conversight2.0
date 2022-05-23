import {
  BaseQueryFn,
  FetchArgs,
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query/react'
import { isStringExists } from '@/Utils/common'
import { Config } from '@/Config'
import { RootState } from '@/Store'
import { logRequestResponse } from './logging'

const csApiBaseQuery = fetchBaseQuery({ baseUrl: Config.CS_API_URL })
const botAPIBaseQuery = fetchBaseQuery({ baseUrl: Config.BOT_API_URL })

const buildBaseQueryWithInterceptor = (
  baseQuery: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError,
    {},
    FetchBaseQueryMeta
  >,
) => {
  const baseQueryWithInterceptor: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
  > = async (args, api, extraOptions) => {
    let adjustedArgs = args

    // Inject auth token i.e ?token=<token>
    const state = api.getState() as RootState
    const token = state.authReducer.authData?.token
    const urlEnd = typeof args === 'string' ? args : args.url
    if (token && !isStringExists(urlEnd, 'token=')) {
      const joinChar = isStringExists(urlEnd, '?') ? '&' : '?'
      const encodedToken = encodeURIComponent(token)
      const adjustedUrl = `${urlEnd}${joinChar}token=${encodedToken}`
      adjustedArgs =
        typeof args === 'string' ? adjustedUrl : { ...args, url: adjustedUrl }
    }

    let result = await baseQuery(adjustedArgs, api, extraOptions)
    if (__DEV__) {
      logRequestResponse(result)
    }
    if (result.error && result.error.status === 401) {
    }

    return result
  }
  return baseQueryWithInterceptor
}

// ConverSight API Service
export const csApi = createApi({
  reducerPath: 'csApi',
  baseQuery: buildBaseQueryWithInterceptor(csApiBaseQuery),
  endpoints: () => ({}),
})

// Bot API Service
export const botApi = createApi({
  reducerPath: 'botApi',
  baseQuery: buildBaseQueryWithInterceptor(botAPIBaseQuery),
  endpoints: () => ({}),
})
