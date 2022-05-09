export const getOrgByOrgId = (orgs: any, id: any) => {
    return orgs.find((x: any) => x.orgId === id)
}