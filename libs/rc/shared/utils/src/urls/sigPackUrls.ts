import { ApiInfo } from '@acx-ui/utils'

export const SigPackUrlsInfo: { [key: string]: ApiInfo } = {
  getSigPack: {
    method: 'get',
    url: '/applicationLibrary?changesIncluded=:changesIncluded',
    newApi: true
  },
  exportAllSigPack: {
    method: 'get',
    url: '/applicationLibrary/csvFile',
    newApi: true
  },
  exportSigPack: {
    method: 'get',
    url: '/applicationLibrary/csvFile?type=:type',
    newApi: true
  },
  updateSigPack: {
    method: 'PATCH',
    url: '/applicationLibrary',
    newApi: true
  }
}
