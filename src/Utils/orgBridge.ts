import { OrgData, NewOrgData } from '@/Types/VerifyEmailResponse'

export const bridgeOrgData = (orgData: NewOrgData[]): OrgData[] => {
  console.log('Bridge input orgData:', orgData)
  const bridged = orgData.map(org => ({
    orgId: org.domain[0]?.domainURL || '',
    domain: org.domain,
    email: '',
    userId: '',
    name: org.name,
    accessList: [],
    isCasdoorOrg: org.isCasdoorOrg,
    apiConfig: null
  }))
  return bridged
}
