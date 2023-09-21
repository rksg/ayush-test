import { ApiInfo } from '@acx-ui/utils'

export const DpskBaseUrl = '/api/dpskServices'

export const DpskBaseUrlWithId = DpskBaseUrl + '/:serviceId'

export const DpskPassphraseBaseUrl = '/api/dpskServices/:serviceId/passphrases'

export const DpskPassphraseBaseUrlWithId = DpskPassphraseBaseUrl + '/:passphraseId'

export const DpskPassphraseDevices = DpskPassphraseBaseUrlWithId + '/devices'

// ======== New API ========

export const NewDpskBaseUrl = '/dpskServices'

export const NewDpskBaseUrlWithId = NewDpskBaseUrl + '/:serviceId'

export const NewDpskPassphraseBaseUrl = NewDpskBaseUrlWithId + '/passphrases'

export const NewDpskPassphraseBaseUrlWithId = NewDpskPassphraseBaseUrl + '/:passphraseId'

export const NewDpskPassphraseDevices = NewDpskPassphraseBaseUrlWithId + '/devices'

const DpskNewFlowPassphraseDevicesUrl = '/v2' + NewDpskPassphraseDevices


const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

export const DpskUrls: { [key: string]: ApiInfo } = {
  getDpsk: {
    method: 'get',
    url: NewDpskBaseUrlWithId,
    oldUrl: DpskBaseUrlWithId,
    newApi: true
  },
  getDpskList: {
    method: 'get',
    url: NewDpskBaseUrl + paginationParams,
    oldUrl: DpskBaseUrl + paginationParams,
    newApi: true
  },
  getEnhancedDpskList: {
    method: 'post',
    url: NewDpskBaseUrl + '/query',
    oldUrl: DpskBaseUrl + '/query',
    newApi: true
  },
  addDpsk: {
    method: 'post',
    url: NewDpskBaseUrl,
    oldUrl: DpskBaseUrl,
    newApi: true
  },
  updateDpsk: {
    method: 'put',
    url: NewDpskBaseUrlWithId,
    oldUrl: DpskBaseUrlWithId,
    newApi: true
  },
  deleteDpsk: {
    method: 'delete',
    url: NewDpskBaseUrlWithId,
    oldUrl: DpskBaseUrlWithId,
    newApi: true
  },
  getEnhancedPassphraseList: {
    method: 'post',
    url: NewDpskPassphraseBaseUrl + '/query',
    oldUrl: DpskPassphraseBaseUrl + '/query',
    newApi: true
  },
  getPassphrase: {
    method: 'get',
    url: NewDpskPassphraseBaseUrlWithId,
    oldUrl: DpskPassphraseBaseUrlWithId,
    newApi: true
  },
  addPassphrase: {
    method: 'post',
    url: NewDpskPassphraseBaseUrl,
    oldUrl: DpskPassphraseBaseUrl,
    newApi: true
  },
  updatePassphrase: {
    method: 'put',
    url: NewDpskPassphraseBaseUrlWithId,
    oldUrl: DpskPassphraseBaseUrlWithId,
    newApi: true
  },
  uploadPassphrases: {
    method: 'post',
    url: NewDpskPassphraseBaseUrl,
    oldUrl: DpskPassphraseBaseUrl,
    newApi: true
  },
  deletePassphrase: {
    method: 'delete',
    url: NewDpskPassphraseBaseUrl,
    oldUrl: DpskPassphraseBaseUrl,
    newApi: true
  },
  exportPassphrases: {
    method: 'get',
    url: NewDpskPassphraseBaseUrl + '?timezone=:timezone&date-format=:dateFormat',
    oldUrl: DpskPassphraseBaseUrl + '?timezone=:timezone&date-format=:dateFormat',
    newApi: true
  },
  exportNewFlowPassphrases: {
    method: 'post',
    url: '/v2' + NewDpskPassphraseBaseUrl + '?timezone=:timezone&date-format=:dateFormat',
    newApi: true
  },
  revokePassphrases: {
    method: 'PATCH',
    url: NewDpskPassphraseBaseUrl,
    oldUrl: DpskPassphraseBaseUrl,
    newApi: true
  },
  getPassphraseClient: {
    method: 'post',
    url: '/dpskpassphrases/client',
    newApi: true
  },
  getNewFlowPassphraseClient: {
    method: 'get',
    url: '/v2/dpskServices/client?mac=:mac&networkId=:networkId',
    newApi: true
  },
  getPassphraseDevices: {
    method: 'get',
    url: NewDpskPassphraseDevices + '?tenantId=:tenantId',
    oldUrl: DpskPassphraseDevices + '?tenantId=:tenantId',
    newApi: true
  },
  updatePassphraseDevices: {
    method: 'PATCH',
    url: NewDpskPassphraseDevices + '?tenantId=:tenantId',
    oldUrl: DpskPassphraseDevices + '?tenantId=:tenantId',
    newApi: true
  },
  deletePassphraseDevices: {
    method: 'delete',
    url: NewDpskPassphraseDevices + '?tenantId=:tenantId',
    oldUrl: DpskPassphraseDevices + '?tenantId=:tenantId',
    newApi: true
  },
  getNewFlowPassphraseDevices: {
    method: 'get',
    url: DpskNewFlowPassphraseDevicesUrl,
    newApi: true
  },
  updateNewFlowPassphraseDevices: {
    method: 'post',
    url: DpskNewFlowPassphraseDevicesUrl,
    newApi: true
  },
  deleteNewFlowPassphraseDevices: {
    method: 'delete',
    url: DpskNewFlowPassphraseDevicesUrl,
    newApi: true
  }
}


export function convertDpskNewFlowUrl (url: string): string {
  return '/v2' + url
}
