import { ApiInfo } from '../apiService'

export const SigPackUrlsInfo: { [key: string]: ApiInfo } = {
  getSigPack: {
    method: 'get',
    url: '/applicationLibrary?changesIncluded=:changesIncluded',
    newApi: true
  },
  exportAllSigPack: {
    method: 'get',
    url: '/applicationLibrary',
    newApi: true
  },
  exportSigPack: {
    method: 'get',
    url: '/applicationLibrary?type=:type',
    newApi: true
  },
  updateSigPack: {
    method: 'PATCH',
    url: '/applicationLibrary',
    newApi: true
  }
}
