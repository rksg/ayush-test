import { MspUrlsInfo }                    from '@acx-ui/msp/utils'
import { AccountType, createHttpRequest } from '@acx-ui/utils'

export async function checkMspRecsForIntegrator (tenantId: string) {
  const tenantDetailRequest = createHttpRequest(MspUrlsInfo.getTenantDetail,
    { tenantId })
  const res = await fetch(tenantDetailRequest.url, tenantDetailRequest)
  const tenantDetail = await res.json()
  if (tenantDetail) {
    const integratorPayload = {
      searchString: '',
      filters: {
        mspTenantId: [tenantDetail?.mspEc?.parentMspId],
        tenantType: [AccountType.MSP_REC]
      },
      fields: [
        'check-all',
        'id',
        'name',
        'tenantType',
        'status',
        'alarmCount',
        'mspAdminCount',
        'mspEcAdminCount',
        'mspInstallerAdminCount',
        'mspIntegratorAdminCount',
        'creationDate',
        'expirationDate',
        'wifiLicense',
        'switchLicense',
        'streetAddress'
      ],
      searchTargetFields: [
        'name'
      ],
      page: 1,
      pageSize: 10,
      defaultPageSize: 10,
      total: 0,
      sortField: 'name',
      sortOrder: 'ASC'
    }
    const mspCustomerListReq = createHttpRequest(MspUrlsInfo.getIntegratorCustomersList)
    const mspCustomerList = await fetch(mspCustomerListReq.url,
      { ...mspCustomerListReq, body: JSON.stringify(integratorPayload) })

    return await mspCustomerList.json()
  }
  return []
}