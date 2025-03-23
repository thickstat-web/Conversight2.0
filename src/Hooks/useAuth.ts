import { selectAuthData } from '@/Store/Auth'
import { useAppSelector } from '.'

export default function () {
  const authData = useAppSelector(selectAuthData)
  const isSignedIn = authData
  return { isSignedIn, authData, token: authData?.token }
}
