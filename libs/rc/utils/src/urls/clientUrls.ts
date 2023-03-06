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
    url: '/api/tenant/:tenantId/wifi/guest-user'
  },
  importGuestPass: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/guest-user/import'
  },
  enableGuests: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/guest-user/:guestId/enable'
  },
  disableGuests: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/guest-user/:guestId/disable'
  },
  getGuests: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/guest/csv-file'
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
