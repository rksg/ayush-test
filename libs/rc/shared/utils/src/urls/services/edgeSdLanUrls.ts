import { ApiInfo } from '@acx-ui/utils'

export const EdgeSdLanUrls: { [key: string]: ApiInfo } = {
  getEdgeSdLanViewDataList: {
    method: 'post',
    url: '/edgeSdLanServices/query',
    newApi: true,
    opsApi: 'POST:/edgeSdLanServices/query'
  },
  getEdgeSdLanList: {
    method: 'get',
    url: '/edgeSdLanServices',
    newApi: true
  },
  getEdgeSdLan: {
    method: 'get',
    url: '/edgeSdLanServices/:serviceId',
    newApi: true
  },
  addEdgeSdLan: {
    method: 'post',
    url: '/edgeSdLanServices',
    newApi: true,
    opsApi: 'POST:/edgeSdLanServices'
  },
  updateEdgeSdLan: {
    method: 'put',
    url: '/edgeSdLanServices/:serviceId',
    newApi: true,
    opsApi: 'PUT:/edgeSdLanServices/{id}'
  },
  updateEdgeSdLanPartial: {
    method: 'PATCH',
    url: '/edgeSdLanServices/:serviceId',
    newApi: true
  },
  deleteEdgeSdLan: {
    method: 'delete',
    url: '/edgeSdLanServices/:serviceId',
    newApi: true,
    opsApi: 'DELETE:/edgeSdLanServices/{id}'
  },
  batchDeleteEdgeSdLan: {
    method: 'delete',
    url: '/edgeSdLanServices',
    newApi: true
  },
  activateEdgeSdLanDmzCluster: {
    method: 'put',
    url: '/edgeSdLanServices/:serviceId/guestSettings/venues/:venueId/edgeClusters/:edgeClusterId',
    newApi: true
  },
  deactivateEdgeSdLanDmzCluster: {
    method: 'delete',
    url: '/edgeSdLanServices/:serviceId/guestSettings/venues/:venueId/edgeClusters/:edgeClusterId',
    newApi: true
  },
  activateEdgeSdLanDmzTunnelProfile: {
    method: 'put',
    url: '/edgeSdLanServices/:serviceId/guestSettings/tunnelProfiles/:tunnelProfileId',
    newApi: true
  },
  deactivateEdgeSdLanDmzTunnelProfile: {
    method: 'delete',
    url: '/edgeSdLanServices/:serviceId/guestSettings/tunnelProfiles/:tunnelProfileId',
    newApi: true
  },
  activateEdgeSdLanNetwork: {
    method: 'put',
    url: '/edgeSdLanServices/:serviceId/wifiNetworks/:wifiNetworkId',
    newApi: true
  },
  deactivateEdgeSdLanNetwork: {
    method: 'delete',
    url: '/edgeSdLanServices/:serviceId/wifiNetworks/:wifiNetworkId',
    newApi: true
  },
  activateEdgeMvSdLanNetwork: {
    method: 'put',
    url: '/edgeSdLanServices/:serviceId/venues/:venueId/wifiNetworks/:wifiNetworkId',
    newApi: true,
    opsApi: 'PUT:/edgeSdLanServices/{id}/venues/{id}/wifiNetworks/{id}'
  },
  deactivateEdgeMvSdLanNetwork: {
    method: 'delete',
    url: '/edgeSdLanServices/:serviceId/venues/:venueId/wifiNetworks/:wifiNetworkId',
    newApi: true,
    opsApi: 'DELETE:/edgeSdLanServices/{id}/venues/{id}/wifiNetworks/{id}'
  },
  toggleEdgeSdLanDmz: {
    method: 'PATCH',
    url: '/edgeSdLanServices/:serviceId/guestSettings',
    newApi: true
  },
  getEdgeSdLanIsDmz: {
    method: 'get',
    url: '/edgeSdLanServices/:serviceId/guestSettings',
    newApi: true
  }
}