import { ApiInfo } from '@acx-ui/utils'

export const ClientUrlsInfo: { [key: string]: ApiInfo } = {
  getClientList: {
    method: 'post',
    url: '/clients/clientlist',
    oldUrl: '/api/viewmodel/:tenantId/client/clientlist',
    newApi: true
  },
  getClientMeta: {
    method: 'post',
    url: '/clients/metas',
    oldUrl: '/api/viewmodel/:tenantId/client/meta',
    newApi: true
  },
  getClientDetails: {
    // [New API] Path variable not match
    // method: 'get',
    // url: '/clients/:clientId/query',
    // oldUrl: '/api/viewmodel/:tenantId/client/:clientId',
    // newApi: true
    method: 'get',
    url: '/api/viewmodel/:tenantId/client/:clientId'
  },
  deleteGuests: {
    method: 'delete',
    url: '/guestUsers',
    oldUrl: '/api/tenant/:tenantId/wifi/guest-user',
    newApi: true
  },
  importGuestPass: {
    method: 'post',
    url: '/networks/:networkId/guestUsers',
    oldUrl: '/api/tenant/:tenantId/wifi/guest-user/import',
    newApi: true
  },
  enableGuests: {
    method: 'PATCH',
    url: '/guestUsers/:guestId',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/wifi/guest-user/:guestId/enable',
    newApi: true
  },
  disableGuests: {
    method: 'PATCH',
    url: '/guestUsers/:guestId',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/wifi/guest-user/:guestId/disable',
    newApi: true
  },
  getGuests: {
    method: 'post',
    url: '/guestUsers/query/csvFiles',
    oldUrl: '/api/viewmodel/tenant/:tenantId/guest/csv-file',
    newApi: true
  },
  generateGuestPassword: {
    method: 'PATCH',
    url: '/guestUsers/:guestId',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/wifi/guest-user/:guestId/regenerate',
    newApi: true
  },
  disconnectClient: {
    method: 'PATCH',
    url: '/aps/clients',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/wifi/disconnect-client',
    newApi: true
  }
}
