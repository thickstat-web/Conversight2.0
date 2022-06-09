export const getOrgByOrgId = (orgs: any, id: any) => {
  return orgs.find((x: any) => x.orgId === id)
}

export const searchInFaq = (faqs: string[], keyword: string) => {
  // toDo fix when the endpoint is good to go with all the required fields
  // so the search will be working as expected

  const result = faqs.filter(x =>
    x.toLowerCase().includes(keyword.toLowerCase()),
  )

  return result
}
