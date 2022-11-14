import { ApiInfo } from '../apiService'

export const MspUrlsInfo: { [key: string]: ApiInfo } = {
  getMspCustomersList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/msp-ec'
  },
  getMspDeviceInventory: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/ec-inventory'
  },
  getIntegratorDeviceInventory: {
    method: 'post',
    url: '/api/viewmodel/tenant/:mspTenantId/ec-inventory'
  },
  getVarDelegations: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/delegations'
  },
  deleteMspEcAccount: {
    method: 'delete',
    url: '/api/mspservice/tenant/:mspEcTenantId'
  }
}
