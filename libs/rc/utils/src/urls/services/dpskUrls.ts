import { ApiInfo } from '../../apiService'

export const DpskBaseUrl = '/api/dpskServices'

export const DpskPassphraseBaseUrl = '/api/dpskServices/:serviceId/passphrases'

export const DpskUrls: { [key: string]: ApiInfo } = {
  getDpsk: {
    method: 'get',
    url: DpskBaseUrl + '/:serviceId'
  },
  getDpskList: {
    method: 'get',
    url: DpskBaseUrl + ''
  },
  addDpsk: {
    method: 'post',
    url: DpskBaseUrl + ''
  },
  updateDpsk: {
    method: 'put',
    url: DpskBaseUrl + '/:serviceId'
  },
  deleteDpsk: {
    method: 'delete',
    url: DpskBaseUrl + '/:serviceId'
  },
  getPassphraseList: {
    method: 'get',
    url: DpskPassphraseBaseUrl + '?size=:pageSize&page=:page&sort=:sort'
  },
  addPassphrase: {
    method: 'post',
    url: DpskPassphraseBaseUrl
  },
  uploadPassphrases: {
    method: 'post',
    url: DpskPassphraseBaseUrl + '/upload'
  },
  deletePassphrase: {
    method: 'delete',
    url: DpskPassphraseBaseUrl
  }
}
