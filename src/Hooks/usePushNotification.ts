import { useCallback, useEffect } from 'react'
import messaging from '@react-native-firebase/messaging'
import { selectFCMToken, setFCMToken } from '@/Store/Auth'
import { useSendFCMTokenMutation } from '@/Services/modules/auth'
import { useAppDispatch, useAppSelector } from '.'

export default function () {
  const storedFCMToken = useAppSelector(selectFCMToken)
  const dispatch = useAppDispatch()
  const [sendFCMToken, { data, isLoading, isSuccess }] = useSendFCMTokenMutation()

  // Register background handler
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('[usePushNotification] Message handled in the background!', remoteMessage);
  });

  const getAndSendFCMToken = useCallback(async () => {
    const fcmToken = await messaging().getToken()
    console.log(`[usePushNotification] FCM token:${fcmToken}`)

    // Send token to API
    sendFCMToken(fcmToken)

    // Store token in the store
    dispatch(setFCMToken(fcmToken))
  }, [dispatch])

  const requestPermission = useCallback(async () => {
    try {
      const authStatus = await messaging().requestPermission()
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL
      console.log('[usePushNotification] Push notification authorization status:', authStatus)
      if (enabled) {
        getAndSendFCMToken()
      }
    } catch (error) {
      // User has rejected the permission for push notification
      console.log('[usePushNotification] Push notification permission rejected', error)
    }
  }, [getAndSendFCMToken])

  const checkPermission = useCallback(async () => {
    const hasPermission = (await messaging().hasPermission()) === messaging.AuthorizationStatus.AUTHORIZED
    hasPermission ? getAndSendFCMToken() : requestPermission()
  }, [getAndSendFCMToken, requestPermission])

  useEffect(() => {
    if (!storedFCMToken) {
      checkPermission()
    }
  }, [storedFCMToken, checkPermission])
}
