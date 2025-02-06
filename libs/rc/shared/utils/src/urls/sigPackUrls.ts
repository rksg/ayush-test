import { ApiInfo } from '@acx-ui/utils'

export const SigPackUrlsInfo: { [key: string]: ApiInfo } = {
  getSigPack: {
    method: 'get',
    url: '/applicationLibrary?changesIncluded=:changesIncluded',
    newApi: true
  },
  getSigPackRbac: {
    method: 'get',
    url: '/applicationLibrarySettings?changesIncluded=:changesIncluded',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  exportAllSigPack: {
    method: 'get',
    url: '/applicationLibrary/csvFile',
    newApi: true,
    defaultHeaders: {
      Accept: 'text/csv'
    }
  },
  exportAllSigPackRbac: {
    method: 'get',
    url: '/applicationLibrarySettings',
    newApi: true,
    defaultHeaders: {
      Accept: 'text/vnd.ruckus.v1+csv'
    }
  },
  exportSigPack: {
    method: 'get',
    url: '/applicationLibrary/csvFile?type=:type',
    newApi: true,
    opsApi: 'GET:/applicationLibrary/csvFile',
    defaultHeaders: {
      Accept: 'text/csv'
    }
  },
  exportSigPackRbac: {
    method: 'get',
    url: '/applicationLibrarySettings?type=:type',
    newApi: true,
    defaultHeaders: {
      Accept: 'text/vnd.ruckus.v1+csv'
    }
  },
  updateSigPack: {
    method: 'PATCH',
    url: '/applicationLibrary',
    opsApi: 'PATCH:/applicationLibrary',
    newApi: true
  },
  updateSigPackRbac: {
    method: 'PATCH',
    url: '/applicationLibrarySettings',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}
