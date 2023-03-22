import { ApiInfo } from '../../apiService'

export const DpskBaseUrl = '/api/dpskServices'

export const DpskPassphraseBaseUrl = '/api/dpskServices/:serviceId/passphrases'

export const NewDpskBaseUrl = '/dpskServices'

export const NewDpskPassphraseBaseUrl = '/dpskServices/:serviceId/passphrases'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

export const DpskUrls: { [key: string]: ApiInfo } = {
  getDpsk: {
    method: 'get',
    url: NewDpskBaseUrl + '/:serviceId',
    oldUrl: DpskBaseUrl + '/:serviceId',
    newApi: true
  },
  getDpskList: {
    method: 'get',
    url: NewDpskBaseUrl + paginationParams,
    oldUrl: DpskBaseUrl + paginationParams,
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
    url: NewDpskBaseUrl + '/:serviceId',
    oldUrl: DpskBaseUrl + '/:serviceId',
    newApi: true
  },
  deleteDpsk: {
    method: 'delete',
    url: NewDpskBaseUrl + '/:serviceId',
    oldUrl: DpskBaseUrl + '/:serviceId',
    newApi: true
  },
  getPassphraseList: {
    method: 'get',
    url: NewDpskPassphraseBaseUrl + paginationParams,
    oldUrl: DpskPassphraseBaseUrl + paginationParams,
    newApi: true
  },
  addPassphrase: {
    method: 'post',
    url: NewDpskPassphraseBaseUrl,
    oldUrl: DpskPassphraseBaseUrl,
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
  }
}
