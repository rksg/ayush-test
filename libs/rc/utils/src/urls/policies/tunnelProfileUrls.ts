import { ApiInfo } from '../../apiService'

export const TunnelProfileUrls: { [key: string]: ApiInfo } = {
  createTunnelProfile: {
    method: 'post',
    url: '/tunnelServiceProfiles',
    newApi: true
  }
}