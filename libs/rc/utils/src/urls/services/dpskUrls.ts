import { ApiInfo } from '../../apiService'

export const DpskUrls: { [key: string]: ApiInfo } = {
  getDpsk: {
    method: 'get',
    url: '/dpskServices/:serviceId'
  },
  getDpskList: {
    method: 'get',
    url: '/dpskServices'
  },
  addDpsk: {
    method: 'post',
    url: '/dpskServices'
  },
  updateDpsk: {
    method: 'patch',
    url: '/dpskServices/:serviceId'
  },
  deleteDpsk: {
    method: 'delete',
    url: '/dpskServices/:serviceId'
  },
  getPassphraseList: {
    method: 'get',
    url: '/dpskServices/:serviceId/passphrases'
  },
  addPassphrase: {
    method: 'post',
    url: '/dpskServices/:serviceId/passphrases'
  },
  uploadPassphrases: {
    method: 'post',
    url: '/dpskServices/:serviceId/passphrases/upload'
  },
  deletePassphrase: {
    method: 'delete',
    url: '/dpskServices/:serviceId/passphrases/:passphraseId'
  }
}
