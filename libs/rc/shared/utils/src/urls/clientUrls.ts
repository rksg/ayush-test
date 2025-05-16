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
  getClients: {
    method: 'post',
    url: '/venues/aps/clients/query',
    newApi: true
  },
  deleteGuest: {
    method: 'delete',
    url: '/wifiNetworks/:networkId/guestUsers/:guestId',
    opsApi: 'DELETE:/wifiNetworks/{id}/guestUsers/{id}',
    newApi: true
  },
  importGuestPass: {
    method: 'post',
    url: '/wifiNetworks/:networkId/guestUsers',
    opsApi: 'POST:/wifiNetworks/{id}/guestUsers',
    newApi: true
  },
  enableGuests: {
    method: 'PATCH',
    url: '/wifiNetworks/:networkId/guestUsers/:guestId',
    opsApi: 'PATCH:/wifiNetworks/{id}/guestUsers/{id}',
    newApi: true
  },
  validateGuestPassword: {
    method: 'PATCH',
    url: '/wifiNetworks/:networkId/guestUsers',
    newApi: true
  },
  disableGuests: {
    method: 'PATCH',
    url: '/wifiNetworks/:networkId/guestUsers/:guestId',
    opsApi: 'PATCH:/wifiNetworks/{id}/guestUsers/{id}',
    newApi: true
  },
  getGuests: {
    method: 'post',
    url: '/guestUsers/query',
    newApi: true
  },
  generateGuestPassword: {
    method: 'PATCH',
    url: '/wifiNetworks/:networkId/guestUsers/:guestId',
    opsApi: 'PATCH:/wifiNetworks/{id}/guestUsers/{id}',
    newApi: true
  },
  disconnectClient: {
    method: 'PATCH',
    url: '/venues/:venueId/aps/:serialNumber/clients/:clientMacAddress',
    opsApi: 'PATCH:/venues/{id}/aps/{id}/clients/{id}',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/wifi/disconnect-client',
    newApi: true
  },
  getClientUEDetail: {
    method: 'GET',
    url: '/clients/:clientMacAddress',
    newApi: true
  },
  getApWiredClients: {
    method: 'post',
    url: '/venues/aps/wiredClients/query',
    newApi: true
  }
}
