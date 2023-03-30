import { ApiInfo } from '../../apiService'

export const TunnelProfileUrls: { [key: string]: ApiInfo } = {
  createTunnelProfile: {
    method: 'post',
    url: '/tunnelServiceProfiles',
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