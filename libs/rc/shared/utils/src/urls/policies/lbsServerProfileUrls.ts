import { ApiInfo } from '@acx-ui/utils'

export const LbsServerProfileUrls: { [key: string]: ApiInfo } = {
  addLbsServerProfile: {
    method: 'post',
    url: '/lbsServerProfiles',
    opsApi: 'POST:/lbsServerProfiles',
    newApi: true
  },
  updateLbsServerProfile: {
    method: 'put',
    url: '/lbsServerProfiles/:policyId',
    opsApi: 'PUT:/lbsServerProfiles/{id}',
    newApi: true
  },
  deleteLbsServerProfile: {
    method: 'delete',
    url: '/lbsServerProfiles/:policyId',
    opsApi: 'DELETE:/lbsServerProfiles/{id}',
    newApi: true
  },
  getLbsServerProfile: {
    method: 'get',
    url: '/lbsServerProfiles/:policyId',
    newApi: true
  },
  getLbsServerProfileList: {
    method: 'post',
    url: '/lbsServerProfiles/query',
    opsApi: 'POST:/lbsServerProfiles/query',
    newApi: true
  },
  activateLbsServerProfileOnVenue: {
    method: 'put',
    url: '/venues/:venueId/lbsServerProfiles/:policyId',
    opsApi: 'PUT:/venues/{id}/lbsServerProfiles/{id}',
    newApi: true
  },
  deactivateLbsServerProfileOnVenue: {
    method: 'delete',
    url: '/venues/:venueId/lbsServerProfiles/:policyId',
    opsApi: 'DELETE:/venues/{id}/lbsServerProfiles/{id}',
    newApi: true
  }
}