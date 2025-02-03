import { ApiInfo } from '@acx-ui/utils'


export const ApSnmpRbacUrls: { [key: string]: ApiInfo } = {
  addApSnmpPolicy: {
    method: 'post',
    url: '/snmpAgentProfiles',
    newApi: true
  },
  getApUsageByApSnmpPolicy: { // detail
    method: 'post',
    url: '/snmpAgentProfiles/query',
    newApi: true
  },
  getApSnmpPolicy: {
    method: 'get',
    url: '/snmpAgentProfiles/:profileId',
    newApi: true
  },
  updateApSnmpPolicy: {
    method: 'put',
    url: '/snmpAgentProfiles/:profileId',
    newApi: true
  },
  deleteApSnmpPolicy: {
    method: 'delete',
    url: '/snmpAgentProfiles/:profileId',
    newApi: true
  },
  updateVenueApSnmpSettings: { //venue instances
    method: 'put',
    url: '/venues/:venueId/snmpAgentProfiles/:profileId',
    opsApi: 'PUT:/venues/{id}/snmpAgentProfiles/{id}',
    newApi: true
  },
  resetVenueApSnmpSettings: { //venue instances
    method: 'delete',
    url: '/venues/:venueId/snmpAgentProfiles/:profileId',
    opsApi: 'DELETE:/venues/{id}/snmpAgentProfiles/{id}',
    newApi: true
  },
  getApSnmpSettings: { //ap instances
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/snmpAgentProfileSettings',
    newApi: true
  },
  resetApSnmpSettings: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/snmpAgentProfileSettings',
    newApi: true
  },
  updateApSnmpSettings: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/snmpAgentProfiles/:profileId',
    newApi: true
  },
  disableApSnmp: {
    method: 'delete',
    url: '/venues/:venueId/aps/:serialNumber/snmpAgentProfiles/:profileId',
    newApi: true
  },
  getApSnmpFromViewModel: {
    method: 'post',
    url: '/snmpAgentProfiles/query',
    newApi: true
  }
}
