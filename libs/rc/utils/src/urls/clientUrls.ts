import { ApiInfo } from '../apiService'

export const ClientUrlsInfo: { [key: string]: ApiInfo } = {
  getClientList: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/client/clientlist'
  },
  getClientMeta: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/client/meta'
  },
  getClientDetails: {
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
    url: '/api/tenant/:tenantId/wifi/guest-user/import'
  },
  guestsAction: {
    method: 'patch',
    url: '/guestUsers/:guestUserId'
    // newApi: true
  },
  enableGuests: {
    method: 'post',
    // url: '/guestUsers/:guestUserId',
    url: '/api/tenant/:tenantId/wifi/guest-user/:guestId/enable'
    // newApi: true
  },
  disableGuests: {
    method: 'post',
    // url: '/guestUsers/:guestUserId',
    url: '/api/tenant/:tenantId/wifi/guest-user/:guestId/disable'
    // newApi: true
  },
  getGuests: {
    method: 'post',
    // API not found
    // url: '/guestUsers/query/csvFiles'
    url: '/api/viewmodel/tenant/:tenantId/guest/csv-file'
    // newApi: true
  },
  generateGuestPassword: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/guest-user/:guestId/regenerate'
  },
  disconnectClient: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/disconnect-client'
  }
}
