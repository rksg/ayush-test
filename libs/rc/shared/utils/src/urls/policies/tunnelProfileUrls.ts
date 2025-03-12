import { ApiInfo } from '@acx-ui/utils'

export const TunnelProfileUrls: { [key: string]: ApiInfo } = {
  createTunnelProfile: {
    method: 'post',
    url: '/tunnelServiceProfiles',
    newApi: true,
    opsApi: 'POST:/tunnelServiceProfiles'
  },
  getTunnelProfileViewDataList: {
    method: 'post',
    url: '/tunnelServiceProfiles/query',
    newApi: true,
    opsApi: 'POST:/tunnelServiceProfiles/query'
  },
  deleteTunnelProfile: {
    method: 'delete',
    url: '/tunnelServiceProfiles/:id',
    newApi: true,
    opsApi: 'DELETE:/tunnelServiceProfiles/{id}'
  },
  getTunnelProfile: {
    method: 'get',
    url: '/tunnelServiceProfiles/:id',
    newApi: true
  },
  updateTunnelProfile: {
    method: 'put',
    url: '/tunnelServiceProfiles/:id',
    newApi: true,
    opsApi: 'PUT:/tunnelServiceProfiles/{id}'
  }
}