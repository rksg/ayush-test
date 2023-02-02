import { ApiInfo } from '../../apiService'

export const DpskBaseUrl = '/api/dpskServices'

export const DpskPassphraseBaseUrl = '/api/dpskServices/:serviceId/passphrases'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

export const DpskUrls: { [key: string]: ApiInfo } = {
  getDpsk: {
    method: 'get',
    url: DpskBaseUrl + '/:serviceId'
  },
  getDpskList: {
    method: 'get',
    url: DpskBaseUrl + paginationParams
  },
  addDpsk: {
    method: 'post',
    url: DpskBaseUrl
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
    url: DpskPassphraseBaseUrl + paginationParams
  },
  addPassphrase: {
    method: 'post',
    url: DpskPassphraseBaseUrl
  },
  uploadPassphrases: {
    method: 'post',
    url: DpskPassphraseBaseUrl
  },
  deletePassphrase: {
    method: 'delete',
    url: DpskPassphraseBaseUrl
  },
  exportPassphrases: {
    method: 'get',
    url: DpskPassphraseBaseUrl + '?timezone=:timezone&date-format=:dateFormat'
  }
}
