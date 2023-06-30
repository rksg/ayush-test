import { ApiInfo } from '@acx-ui/utils'

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
  },
  getTunnelProfile: {
    method: 'get',
    url: '/tunnelServiceProfiles/:id',
    newApi: true
  },
  updateTunnelProfile: {
    method: 'put',
    url: '/tunnelServiceProfiles/:id',
    newApi: true
  }
}