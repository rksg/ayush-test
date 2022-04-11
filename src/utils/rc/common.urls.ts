interface ApiInfo {
  url: string;
  method: string;
}
export const CommonUrlsInfo: { [key: string]: ApiInfo } = {
  getVMNetworksList: {
    method: 'post',
    url: '/api/viewmodel/tenant/{tenantId}/network'
  },
  addNetworkDeep: {
    method: 'post',
    url: '/api/tenant/{tenantId}/wifi/network/deep?quickAck=true'
  },
  getNetworksVenuesList: {
    method: 'post',
    url: '/api/viewmodel/tenant/{tenantId}/network/{networkId}/venues'
  },
  getCloudpathList: {
    method: 'get',
    url: '/api/tenant/{tenantId}/wifi/cloudpath'
  }
}
