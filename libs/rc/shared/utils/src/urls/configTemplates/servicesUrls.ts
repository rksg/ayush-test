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
  },
  addDhcp: {
    method: 'post',
    url: '/templates/dhcpConfigServiceProfiles',
    newApi: true
  },
  getDhcpList: {
    method: 'get',
    url: '/templates/dhcpConfigServiceProfiles',
    newApi: true
  },
  updateDhcp: {
    method: 'put',
    url: '/templates/dhcpConfigServiceProfiles/:serviceId',
    newApi: true
  },
  getDhcp: {
    method: 'get',
    url: '/templates/dhcpConfigServiceProfiles/:serviceId',
    newApi: true
  },
  deleteDhcp: {
    method: 'delete',
    url: '/templates/dhcpConfigServiceProfiles/:templateId',
    newApi: true
  },
  getPortal: {
    method: 'get',
    url: '/templates/portalServiceProfiles/:serviceId',
    newApi: true
  },
  addPortal: {
    method: 'post',
    url: '/templates/portalServiceProfiles',
    newApi: true
  },
  updatePortal: {
    method: 'put',
    url: '/templates/portalServiceProfiles/:serviceId',
    newApi: true
  },
  deletePortal: {
    method: 'delete',
    url: '/templates/portalServiceProfiles/:templateId',
    newApi: true
  },
  getEnhancedPortalList: {
    method: 'post',
    url: '/templates/portalServiceProfiles/query',
    newApi: true
  }
}
