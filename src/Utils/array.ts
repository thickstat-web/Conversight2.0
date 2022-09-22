import { OrgData } from "@/Types/VerifyEmailResponse"

export const getOrgByOrgId = (orgs: OrgData[], id: string) => {
  return orgs.find((x: OrgData) => x.orgId === id)
}

export const searchInFaq = (faqs: string[], keyword: string) => {
  // ToDo: Fix when the endpoint is good to go with all the required fields
  // so the search will be working as expected
  const result = faqs.filter(x =>
    x.toLowerCase().includes(keyword.toLowerCase()),
  )

  return result
}
