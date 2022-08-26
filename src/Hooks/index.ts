import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@/Store'
export { default as useTheme } from './useTheme'
export { default as useAuth } from './useAuth'
export { default as useFaq } from './useFaq'
export { default as usePinboardData } from './usePinboardData'
export { default as useInsightsData } from './useInsightsData'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
