import { useCallback, useEffect } from 'react'
import {
  selectAllOrganizations,
  selectSignInOrg,
  setSelectedOrg,
} from '@/Store/Auth'
import { useAppDispatch, useAppSelector } from '.'
import { getOrgByOrgId } from '@/Utils/array'
import { setCustomHosts, setDefaultHosts } from '@/Config'

export default function () {
  const dispatch = useAppDispatch()
  const signInOrg = useAppSelector(selectSignInOrg)
  const organizations = useAppSelector(selectAllOrganizations)

  const setSignInOrgId = useCallback(
    (orgId: string) => {
      const org = getOrgByOrgId(organizations, orgId)
      if (org) {
        if (signInOrg?.orgId !== org.orgId) {
          dispatch(setSelectedOrg(org))
        }
        if (org.apiConfig) {
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
    } else if (signInOrg) {
      setSignInOrgId(signInOrg.orgId)
    }
  }, [isSingleOrg, organizations, signInOrg, setSignInOrgId])

  return { organizations, signInOrg, setSignInOrgId, isSingleOrg }
}
