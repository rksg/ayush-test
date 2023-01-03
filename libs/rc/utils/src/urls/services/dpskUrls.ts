import { ApiInfo } from '../../apiService'

export const DpskUrls: { [key: string]: ApiInfo } = {
  getDpsk: {
    method: 'get',
    url: '/api/dpskServices/:serviceId'
  },
  getDpskList: {
    method: 'get',
    url: '/api/dpskServices'
  },
  addDpsk: {
    method: 'post',
    url: '/api/dpskServices'
  },
  updateDpsk: {
    method: 'put',
    url: '/api/dpskServices/:serviceId'
  },
  deleteDpsk: {
    method: 'delete',
    url: '/api/dpskServices/:serviceId'
  },
  getPassphraseList: {
    method: 'get',
    url: '/api/dpskServices/:serviceId/passphrases?size=:pageSize&page=:page&sort=:sort'
  },
  addPassphrase: {
    method: 'post',
    url: '/api/dpskServices/:serviceId/passphrases'
  },
  uploadPassphrases: {
    method: 'post',
    url: '/api/dpskServices/:serviceId/passphrases/upload'
  },
  deletePassphrase: {
    method: 'delete',
    url: '/api/dpskServices/:serviceId/passphrases'
  }
}
