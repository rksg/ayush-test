import { ApiInfo } from '../apiService'

const apiUrl = '/api/radiusClient'

export const RadiusClientConfigUrlsInfo: { [key: string]: ApiInfo } = {
  getRadiusClient: {
    method: 'get',
    url: apiUrl
  },
  updateRadiusClient: {
    method: 'PATCH',
    url: apiUrl
  },
  getRadiusServerSetting: {
    method: 'get',
    url: apiUrl + '/serverSettings'
  }
}
