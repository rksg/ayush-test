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
  },
  getEthernetPortSettingsByVenueApModel: {
    method: 'get',
    url: '/venues/:venueId/apModels/:apModel/lanPorts/:portId/settings',
    newApi: true
  },
  updateEthernetPortSettingsByVenueApModel: {
    method: 'put',
    url: '/venues/:venueId/apModels/:apModel/lanPorts/:portId/settings',
    newApi: true
  },
  activateEthernetPortProfileOnVenueApModelPortId: {
    method: 'put',
    url: '/venues/:venueId/apModels/:apModel/lanPorts/:portId/ethernetPortProfiles/:id',
    newApi: true
  },
  getEthernetPortSettingsByApPortId: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/lanPorts/:portId/settings',
    newApi: true
  },
  updateEthernetPortSettingsByApPortId: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/lanPorts/:portId/settings',
    newApi: true
  },
  activateEthernetPortProfileOnApPortId: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/lanPorts/:portId/ethernetPortProfiles/:id',
    newApi: true
  }
}