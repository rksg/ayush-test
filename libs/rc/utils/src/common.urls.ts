interface ApiInfo {
  url: string;
  method: string;
}

export const websocketServerUrl = '/api/websocket/socket.io'

export const CommonUrlsInfo: { [key: string]: ApiInfo } = {
  getVMNetworksList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/network'
  },
  addNetworkDeep: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/network/deep?quickAck=true'
  },
  getNetworksDetailHeader: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/network/:networkId/detailheader'
  },
  getNetworksVenuesList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/network/:networkId/venues'
  },
  getCloudpathList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/cloudpath'
  },
  getDashboardOverview: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/dashboard/overview/'
  },
  getAlarmsList: {
    method: 'post',
    url: '/api/eventalarmapi/:tenantId/alarm/alarmlist'
  },
  getAlarmsListMeta: {
    method: 'post',
    url: '/api/eventalarmapi/:tenantId/alarm/meta'
  },
  getApsList: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/aps'
  }
}
