import AsyncStorage from '@react-native-async-storage/async-storage'
import { Action, combineReducers, Middleware } from 'redux'
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import { configureStore, ThunkAction } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

import { csApi, botApi, ingressApi } from '@/Services/api'
import * as modules from '@/Services/modules'
import theme from './Theme'
import authReducer from './Auth'
import appReducer from './App'
import settingsReducer from './Settings'
import faqReducer from './Faq'
import {
  AUTH_REDUCER,
  THEME_REDUCER,
  APP_REDUCER,
  SETTING_REDUCER,
  FAQ_REDUCER,
} from '@/Constants/redux'

const reducers = combineReducers({
  theme,
  authReducer,
  appReducer,
  settingsReducer,
  faqReducer,
  ...Object.values(modules).reduce(
    (acc, module) => ({
      ...acc,
      [module.reducerPath]: module.reducer,
    }),
    {},
  ),
})

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: [THEME_REDUCER, AUTH_REDUCER],
  blackList: [APP_REDUCER, SETTING_REDUCER, FAQ_REDUCER],
}

const persistedReducer = persistReducer(persistConfig, reducers)

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: __DEV__
        ? false
        : {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
    }).concat([
      csApi.middleware as Middleware,
      botApi.middleware as Middleware,
      ingressApi.middleware as Middleware,
    ])

    // if (__DEV__ && !process.env.JEST_WORKER_ID) {
    //   const createDebugger = require('redux-flipper').default
    //   middlewares.push(createDebugger())
    // }

    return middlewares
  },
})

const persistor = persistStore(store)

// setupListeners(store.dispatch)

export { store, persistor }

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
