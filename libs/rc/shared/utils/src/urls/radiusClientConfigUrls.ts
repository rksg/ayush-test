import { ApiInfo } from '@acx-ui/utils'

const newApiUrl = '/radiusClient'
const apiUrl = '/api/radiusClient'

export const RadiusClientConfigUrlsInfo: { [key: string]: ApiInfo } = {
  getRadiusClient: {
    method: 'get',
    url: newApiUrl,
    oldUrl: apiUrl,
    newApi: true
  },
  updateRadiusClient: {
    method: 'PATCH',
    url: newApiUrl,
    oldUrl: apiUrl,
    newApi: true
  },
  getRadiusServerSetting: {
    method: 'get',
    url: newApiUrl + '/serverSettings',
    oldUrl: apiUrl + '/serverSettings',
    newApi: true
  }
}
