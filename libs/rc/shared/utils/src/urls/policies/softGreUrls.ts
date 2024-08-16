import { ApiInfo } from '@acx-ui/utils'
// TODO jean - all urls
export const SoftGreUrls: { [key: string]: ApiInfo } = {
  createSoftGre: {
    method: 'post',
    url: '/softGreProfiles',
    newApi: true
  },
  getSoftGreViewDataList: {
    method: 'post',
    url: '/softGreProfiles/query',
    newApi: true
  },
  deleteSoftGre: {
    method: 'delete',
    url: '/softGreProfiles/:policyId',
    newApi: true
  },
  getSoftGre: {
    method: 'get',
    url: '/softGreProfiles/:policyId',
    newApi: true
  },
  updateSoftGre: {
    method: 'put',
    url: '/softGreProfiles/:policyId',
    newApi: true
  },
  activateSoftGre: {
    method: 'put',
    url: '/venues/:venueId/wifiNetworks/:networkId/softGreProfiles/:policyId',
    newApi: true
  },
  dectivateSoftGre: {
    method: 'put',
    url: '/venues/:venueId/wifiNetworks/:networkId/softGreProfiles/:policyId',
    newApi: true
  },
  updateSoftGreOnVenueAndNetwork: { // aaaAffinityEnable
    method: 'put',
    url: '/venues/:venueId/wifiNetworks/:networkId/softGreProfiles/:policyId/settings',
    newApi: true
  },
  getSoftGreOnVenueAndNetwork: {
    method: 'get',
    url: '/venues/:venueId/wifiNetworks/:networkId/softGreProfiles/:policyId/settings',
    newApi: true
  }
}