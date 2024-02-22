import { ApiInfo } from '@acx-ui/utils'

export const ServicesConfigTemplateUrlsInfo: { [key: string]: ApiInfo } = {
  getDpsk: {
    method: 'get',
    url: '/templates/dpskServices/:serviceId',
    newApi: true
  },
  addDpsk: {
    method: 'post',
    url: '/templates/dpskServices',
    newApi: true
  },
  updateDpsk: {
    method: 'put',
    url: '/templates/dpskServices/:serviceId',
    newApi: true
  },
  deleteDpsk: {
    method: 'delete',
    url: '/templates/dpskServices/:templateId',
    newApi: true
  },
  getEnhancedDpskList: {
    method: 'post',
    url: '/templates/dpskServices/query',
    newApi: true
  }
}
