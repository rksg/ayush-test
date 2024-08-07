import { ApiInfo } from '@acx-ui/utils'

export const EthernetPortProfileUrls: { [key: string]: ApiInfo } = {
  createEthernetPortProfile: {
    method: 'post',
    url: '/ethernetPortProfiles',
    newApi: true
  },
  getEthernetPortProfileViewDataList: {
    method: 'post',
    url: '/ethernetPortProfiles/query',
    newApi: true
  },
  deleteEthernetPortProfile: {
    method: 'delete',
    url: '/ethernetPortProfiles/:id',
    newApi: true
  },
  getEthernetPortProfile: {
    method: 'get',
    url: '/ethernetPortProfiles/:id',
    newApi: true
  },
  updateEthernetPortProfile: {
    method: 'put',
    url: '/ethernetPortProfiles/:id',
    newApi: true
  },
  updateEthernetPortProfileRadiusId: {
    method: 'put',
    url: '/ethernetPortProfiles/:id/radiusServerProfiles/:radiusId',
    newApi: true
  }
  ,
  deleteEthernetPortProfileRadiusId: {
    method: 'delete',
    url: '/ethernetPortProfiles/:id/radiusServerProfiles/:radiusId',
    newApi: true
  }
}