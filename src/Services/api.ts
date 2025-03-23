import {
  BaseQueryFn,
  FetchArgs,
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query/react'
import { isStringExists } from '@/Utils/common'
import { RootState } from '@/Store'
import { logRequestResponse } from './logging'
import AsyncStorage from '@react-native-async-storage/async-storage'

const csApiBaseQuery = fetchBaseQuery({ baseUrl: 'https://' })
const botAPIBaseQuery = fetchBaseQuery({ baseUrl: 'https://' })
const ingressAPIBaseQuery = fetchBaseQuery({ baseUrl: 'https://' })

type BaseQuery = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
>

const buildBaseQueryWithInterceptor = (baseQuery: BaseQuery) => {
  const baseQueryWithInterceptor: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
  > = async (args, api, extraOptions) => {
    let adjustedArgs = args

    // Inject auth token i.e ?token=<token>
    const state = api.getState() as RootState
    const token = state.authReducer.authData?.token || await AsyncStorage.getItem('authToken');
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

// Ingress API Service
export const ingressApi = createApi({
  reducerPath: 'ingressApi',
  baseQuery: buildBaseQueryWithInterceptor(ingressAPIBaseQuery),
  endpoints: () => ({}),
})
