import { ApiInfo } from '../../apiService'

export const TunnelProfileUrls: { [key: string]: ApiInfo } = {
  createTunnelProfile: {
    method: 'post',
    url: '/tunnelServiceProfiles',
    newApi: true
  },
  getTunnelProfileViewDataList: {
    method: 'post',
    url: '/tunnelServiceProfiles/query',
    newApi: true
  },
  batchDeleteTunnelProfile: {
    method: 'delete',
    url: '/tunnelServiceProfiles',
    newApi: true
  },
  deleteTunnelProfile: {
    method: 'delete',
    url: '/tunnelServiceProfiles/:id',
    newApi: true
  }
}