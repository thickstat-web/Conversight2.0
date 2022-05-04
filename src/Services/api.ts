import { Config } from '@/Config'
import {
  BaseQueryFn,
  FetchArgs,
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query/react'
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
    let result = await baseQuery(args, api, extraOptions)
    if (result.error && result.error.status === 401) {
    }

    if (__DEV__) {
      logRequestResponse(result)
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
