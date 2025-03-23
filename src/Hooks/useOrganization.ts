import { useCallback, useEffect } from 'react'
import {
  selectAllOrganizations,
  selectSignInOrg,
  setSelectedOrg,
} from '@/Store/Auth'
import { useAppDispatch, useAppSelector } from '.'
import { getOrgByOrgId } from '@/Utils/array'
import { setCustomHosts, setDefaultHosts } from '@/Config'
import { selectCustomHost } from '@/Store/HostURL'
import { ENTER_CASDOOR_SCREEN } from '@/Constants/screens'
import { useNavigation } from '@react-navigation/native';

export default function () {
  const dispatch = useAppDispatch()
  const signInOrg = useAppSelector(selectSignInOrg)
  const navigation = useNavigation<any>();
  const organizations = useAppSelector(selectAllOrganizations)
  const customHosts = useAppSelector(selectCustomHost)

  const setSignInOrgId = useCallback(
    (orgId: string) => {
      const org = getOrgByOrgId(organizations, orgId)
      if (org) {
        if (signInOrg?.orgId !== org.orgId) {
          dispatch(setSelectedOrg(org))
        }
        if (org?.isCasdoorOrg) {
          const { apiServerHost, botServerHost, ingressServerHost } = customHosts
          setCustomHosts(apiServerHost, botServerHost, ingressServerHost)
        }
        else if (org.apiConfig) {
          const { apiServerHost, botServerHost, ingressServerHost } =
            org.apiConfig
          setCustomHosts(apiServerHost, botServerHost, ingressServerHost)
        } else {
          setDefaultHosts()
        }
      }
    },
    [dispatch, organizations, signInOrg?.orgId],
  )

  const isSingleOrg = organizations.length === 1
  useEffect(() => {
    if (isSingleOrg) {
      setSignInOrgId(organizations[0].orgId)
      if (organizations[0].isCasdoorOrg) {
        navigation.navigate(ENTER_CASDOOR_SCREEN, { redirectURL: organizations[0]?.domain[0]?.domainURL })
      }
    } else if (signInOrg) {
      setSignInOrgId(signInOrg.orgId)
    }
  }, [isSingleOrg, organizations, signInOrg, setSignInOrgId])

  return { organizations, signInOrg, setSignInOrgId, isSingleOrg }
}
