import { ApiInfo } from '../apiService'

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
    // Path variable not match
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
    // different method
    // method: 'patch',
    // url: '/guestUsers/:guestUserId',
    // oldUrl: '/api/tenant/:tenantId/wifi/guest-user/:guestId/enable',
    // newApi: true
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/guest-user/:guestId/enable'
  },
  disableGuests: {
    // different method
    // method: 'patch',
    // url: '/guestUsers/:guestUserId',
    // oldUrl: '/api/tenant/:tenantId/wifi/guest-user/:guestId/disable',
    // newApi: true
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/guest-user/:guestId/disable'
  },
  getGuests: {
    method: 'post',
    url: '/guestUsers/query/csvFiles',
    oldUrl: '/api/viewmodel/tenant/:tenantId/guest/csv-file',
    newApi: true
  },
  generateGuestPassword: {
    // different method
    // method: 'patch',
    // url: '/guestUsers/:guestUserId',
    // oldUrl: '/api/tenant/:tenantId/wifi/guest-user/:guestId/regenerate',
    // newApi: true
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/guest-user/:guestId/regenerate'
  },
  disconnectClient: {
    // different method
    // method: 'patch',
    // url: '/aps/clients',
    // oldUrl: '/api/tenant/:tenantId/wifi/disconnect-client',
    // newApi: true
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/disconnect-client'
  }
}
