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
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1.1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateDpsk: {
    method: 'put',
    url: NewDpskBaseUrlWithId,
    oldUrl: DpskBaseUrlWithId,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1.1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
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
    newApi: true,
    opsApi: 'POST:/dpskServices/{id}/passphrases'
  },
  updatePassphrase: {
    method: 'put',
    url: NewDpskPassphraseBaseUrlWithId,
    oldUrl: DpskPassphraseBaseUrlWithId,
    newApi: true,
    opsApi: 'PUT:/dpskServices/{id}/passphrases/{id}'
  },
  uploadPassphrases: {
    method: 'post',
    url: NewDpskPassphraseBaseUrl + '/csvFiles',
    oldUrl: DpskPassphraseBaseUrl + '/csvFiles',
    newApi: true,
    opsApi: 'POST:/dpskServices/{id}/passphrases/csvFiles'
  },
  deletePassphrase: {
    method: 'delete',
    url: NewDpskPassphraseBaseUrl,
    oldUrl: DpskPassphraseBaseUrl,
    newApi: true,
    opsApi: 'DELETE:/dpskServices/{id}/passphrases'
  },
  exportPassphrases: {
    method: 'get',
    url: NewDpskPassphraseBaseUrl + '?timezone=:timezone&date-format=:dateFormat',
    oldUrl: DpskPassphraseBaseUrl + '?timezone=:timezone&date-format=:dateFormat',
    newApi: true
  },
  exportNewFlowPassphrases: {
    method: 'post',
    url: NewDpskPassphraseBaseUrl + '/query/csvFiles?timezone=:timezone&date-format=:dateFormat',
    newApi: true
  },
  revokePassphrases: {
    method: 'PATCH',
    url: NewDpskPassphraseBaseUrl,
    oldUrl: DpskPassphraseBaseUrl,
    newApi: true,
    opsApi: 'PATCH:/dpskServices/{id}/passphrases'
  },
  getPassphraseClient: {
    method: 'get',
    url: NewDpskBaseUrl + '/client?mac=:mac&networkId=:networkId',
    newApi: true
  },
  getPassphraseDevices: {
    method: 'get',
    url: NewDpskPassphraseDevices,
    oldUrl: DpskPassphraseDevices,
    newApi: true
  },
  updatePassphraseDevices: {
    method: 'post',
    url: NewDpskPassphraseDevices,
    oldUrl: DpskPassphraseDevices,
    newApi: true,
    opsApi: 'POST:/dpskServices/{id}/passphrases/{id}/devices'
  },
  deletePassphraseDevices: {
    method: 'delete',
    url: NewDpskPassphraseDevices,
    oldUrl: DpskPassphraseDevices,
    newApi: true,
    opsApi: 'DELETE:/dpskServices/{id}/passphrases/{id}/devices'
  },
  deleteDpskPolicySet: {
    method: 'delete',
    url: NewDpskBaseUrlWithId + '/policySets',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  updateDpskPolicySet: {
    method: 'put',
    url: NewDpskBaseUrlWithId + '/policySets/:policySetId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  createDpskWithIdentityGroup: {
    method: 'post',
    url: '/identityGroups/:identityGroupId/dpskServices',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  }
}
