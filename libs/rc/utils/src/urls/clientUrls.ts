import { ApiInfo } from '../apiService'

export const ClientUrlsInfo: { [key: string]: ApiInfo } = {
  getClientDetails: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/client/:clientId'
  },
  deleteGuests: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/guest-user'
  },
  enableGuests: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/guest-user/:guestId/enable'
  },
  disableGuests: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/guest-user/:guestId:/disable'
  },
  getGuests: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/guest/csv-file'
  },
  generateGuestPassword: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/guest-user/:guestId/regenerate'
  }
}
