import { ApiInfo } from '../apiService'

export const RadiusClientConfigUrlsInfo: { [key: string]: ApiInfo } = {
  getRadiusClient: {
    method: 'get',
    url: '/api/radiusClient'
  },
  updateRadiusClient: {
    method: 'PATCH',
    url: '/api/radiusClient'
  },
  getRadiusServerSetting: {
    method: 'get',
    url: '/api/radiusServer'
  }
}
