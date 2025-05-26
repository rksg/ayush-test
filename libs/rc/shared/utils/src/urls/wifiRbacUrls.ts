import { ApiInfo } from '@acx-ui/utils'

import { WifiConfigUrlsInfo } from './wifiConfigUrls'
import { WifiUrlsInfo }       from './wifiUrls'

export const WifiRbacUrlsInfo: { [key: string]: ApiInfo } = {
  ...WifiUrlsInfo,
  ...WifiConfigUrlsInfo,

  getNetwork: {
    method: 'get',
    //url: '/networks/:networkId',
    url: '/wifiNetworks/:networkId',
    opsApi: 'GET:/wifiNetworks/{id}',
    newApi: true
  },
  addNetworkDeep: {
    method: 'post',
    //url: '/networks',
    url: '/wifiNetworks',
    opsApi: 'POST:/wifiNetworks',
    newApi: true
  },
  updateNetworkDeep: {
    method: 'put',
    //url: '/networks/:networkId',
    url: '/wifiNetworks/:networkId',
    opsApi: 'PUT:/wifiNetworks/{id}',
    newApi: true
  },
  deleteNetwork: {
    method: 'delete',
    //url: '/networks/:networkId',
    url: '/wifiNetworks/:networkId',
    opsApi: 'DELETE:/wifiNetworks/{id}',
    newApi: true
  },
  getVenueApGroups: {
    method: 'get',
    url: '/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId/settings',
    newApi: true
  },
  updateVenueApGroups: {
    method: 'put',
    url: '/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId/settings',
    newApi: true
  },
  activateVenueApGroup: {
    method: 'put',
    url: '/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateVenueApGroup: {
    method: 'delete',
    url: '/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getNetworkVenue: {
    method: 'get',
    url: '/venues/:venueId/wifiNetworks/:networkId/settings',
    newApi: true
  },
  getNetworkVenues: {
    method: 'post',
    url: '/venues/wifiNetworks/query',
    newApi: true
  },
  addNetworkVenue: {
    //method: 'post',
    //url: '/networkActivations',
    method: 'put',
    url: '/venues/:venueId/wifiNetworks/:networkId',
    opsApi: 'PUT:/venues/{id}/wifiNetworks/{id}',
    newApi: true
  },
  updateNetworkVenue: {
    method: 'put',
    //url: '/networkActivations/:networkVenueId?quickAck=true',
    url: '/venues/:venueId/wifiNetworks/:networkId/settings',
    opsApi: 'PUT:/venues/{id}/wifiNetworks/{id}/settings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteNetworkVenue: {
    method: 'delete',
    //url: '/networkActivations/:networkVenueId',
    url: '/venues/:venueId/wifiNetworks/:networkId',
    opsApi: 'DELETE:/venues/{id}/wifiNetworks/{id}',
    newApi: true
  },
  getVenueApCapabilities: {
    method: 'get',
    //url: '/venues/:venueId/aps/capabilities',
    url: '/venues/:venueId/apModelCapabilities',
    newApi: true
  },
  getApGroupApCapabilities: {
    method: 'get',
    url: '/venues/:venueId/apGroups/:apGroupId/apModelCapabilities',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getAp: {
    method: 'get',
    // url: '/venues/aps/:serialNumber?operational=false',
    url: '/venues/:venueId/aps/:serialNumber?operational=false',
    opsApi: 'GET:/venues/{id}/aps/{id}',
    newApi: true
  },
  getApOperational: {
    method: 'get',
    // url: '/venues/aps/:serialNumber?operational=true',
    url: '/venues/:venueId/aps/:serialNumber?operational=true',
    newApi: true
  },
  getApValidChannel: {
    method: 'get',
    //url: '/venues/aps/:serialNumber/channels',
    url: '/venues/:venueId/aps/:serialNumber/wifiAvailableChannels',
    newApi: true
  },
  getWifiCapabilities: {
    method: 'get',
    //url: '/venues/aps/capabilities',
    url: '/venues/apModelCapabilities',
    newApi: true
  },
  addAp: {
    method: 'post',
    // url: '/venues/aps',
    url: '/venues/:venueId/apGroups/:apGroupId/aps',
    opsApi: 'POST:/venues/{id}/apGroups/{id}/aps',
    newApi: true
  },
  addApWithDefaultGroup: {
    method: 'post',
    // url: '/venues/aps',
    url: '/venues/:venueId/aps',
    newApi: true
  },
  moveApToTargetApGroup: {
    method: 'put',
    url: '/venues/:venueId/apGroups/:apGroupId/aps/:serialNumber',
    opsApi: 'PUT:/venues/{id}/apGroups/{id}/aps/{id}',
    newApi: true
  },
  updateAp: {
    method: 'put',
    // url: '/venues/aps/:serialNumber',
    url: '/venues/:venueId/aps/:serialNumber',
    opsApi: 'PUT:/venues/{id}/aps/{id}',
    newApi: true
  },
  getImportResult: {
    method: 'get',
    // url: '/venues/aps/importResults',
    url: '/venues/:venueId/aps/importResults',
    newApi: true
  },
  getApGroupsList: {
    method: 'post',
    // url: '/apGroups/query',
    url: '/venues/apGroups/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addApGroup: {
    method: 'post',
    url: '/venues/:venueId/apGroups',
    opsApi: 'POST:/venues/{id}/apGroups',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getApGroup: {
    method: 'get',
    url: '/venues/:venueId/apGroups/:apGroupId',
    // url: '/venues/apGroups/:apGroupId',
    opsApi: 'GET:/venues/{id}/apGroups/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateApGroup: {
    method: 'put',
    url: '/venues/:venueId/apGroups/:apGroupId',
    // url: '/venues/apGroups/:apGroupId',
    opsApi: 'PUT:/venues/{id}/apGroups/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteApGroup: {
    method: 'delete',
    url: '/venues/:venueId/apGroups/:apGroupId',
    // url: '/venues/apGroups/:apGroupId',
    opsApi: 'DELETE:/venues/{id}/apGroups/{id}',
    newApi: true
  },

  // deprecated. use the getDhcpAps to replace
  getDhcpAp: {
    method: 'get',
    // url: '/venues/dhcpApSettings/query',
    url: '/venues/:venueId/aps/:serialNumber/dhcpSettings',
    newApi: true
  },
  getDhcpAps: {
    method: 'post',
    url: '/venues/aps/dhcpSettings/query',
    newApi: true
  },
  deleteAp: {
    method: 'delete',
    // url: '/venues/aps/:serialNumber',
    url: '/venues/:venueId/aps/:serialNumber',
    opsApi: 'DELETE:/venues/{id}/aps/{id}',
    newApi: true
  },
  deleteSoloAp: {
    method: 'delete',
    // url: '/venues/aps/:serialNumber?resetFirmware=true',
    url: '/venues/:venueId/aps/:serialNumber?resetFirmware=true',
    newApi: true
  },
  downloadApLog: {
    method: 'get',
    // url: '/venues/aps/:serialNumber/logs',
    url: '/venues/:venueId/aps/:serialNumber/logs',
    newApi: true
  },
  rebootAp: {
    method: 'PATCH',
    // url: '/venues/aps/:serialNumber',
    url: '/venues/:venueId/aps/:serialNumber/systemCommands',
    newApi: true
  },
  factoryResetAp: {
    method: 'PATCH',
    // url: '/venues/aps/:serialNumber',
    url: '/venues/:venueId/aps/:serialNumber/systemCommands',
    newApi: true
  },
  getApPhoto: {
    method: 'get',
    //url: '/venues/aps/:serialNumber/pictures',
    url: '/venues/:venueId/aps/:serialNumber/pictures',
    opsApi: 'GET:/venues/{id}/aps/{id}/pictures',
    newApi: true
  },
  addApPhoto: {
    method: 'put',
    //url: '/venues/aps/:serialNumber/pictures',
    url: '/venues/:venueId/aps/:serialNumber/pictures',
    opsApi: 'PUT:/venues/{id}/aps/{id}/pictures',
    newApi: true
  },
  deleteApPhoto: {
    method: 'delete',
    //url: '/venues/aps/:serialNumber/pictures',
    url: '/venues/:venueId/aps/:serialNumber/pictures',
    opsApi: 'DELETE:/venues/{id}/aps/{id}/pictures',
    newApi: true
  },
  pingAp: {
    method: 'PATCH',
    // url: '/venues/aps/:serialNumber',
    url: '/venues/:venueId/aps/:serialNumber/diagnosisCommands',
    opsApi: 'PATCH:/venues/{id}/aps/{id}/diagnosisCommands',
    newApi: true
  },
  traceRouteAp: {
    method: 'PATCH',
    // url: '/venues/aps/:serialNumber',
    url: '/venues/:venueId/aps/:serialNumber/diagnosisCommands',
    opsApi: 'PATCH:/venues/{id}/aps/{id}/diagnosisCommands',
    newApi: true
  },
  startPacketCapture: {
    method: 'PATCH',
    // url: '/venues/aps/:serialNumber/packets',
    url: '/venues/:venueId/aps/:serialNumber/packets',
    opsApi: 'PATCH:/venues/{id}/aps/{id}/packets',
    newApi: true
  },
  stopPacketCapture: {
    method: 'PATCH',
    // url: '/venues/aps/:serialNumber/packets',
    url: '/venues/:venueId/aps/:serialNumber/packets',
    opsApi: 'PATCH:/venues/{id}/aps/{id}/packets',
    newApi: true
  },
  getPacketCaptureState: {
    method: 'get',
    // url: '/venues/aps/:serialNumber/packets',
    url: '/venues/:venueId/aps/:serialNumber/packets',
    opsApi: 'GET:/venues/{id}/aps/{id}/packets',
    newApi: true
  },
  blinkLedAp: {
    method: 'PATCH',
    // url: '/venues/aps/:serialNumber',
    url: '/venues/:venueId/aps/:serialNumber/diagnosisCommands',
    opsApi: 'PATCH:/venues/{id}/aps/{id}/diagnosisCommands',
    newApi: true
  },
  getApCapabilities: {
    method: 'get',
    //url: '/venues/aps/:serialNumber/capabilities',
    url: '/venues/:venueId/aps/:serialNumber/capabilities',
    newApi: true
  },

  getApNeighbors: {
    method: 'post',
    url: '/venues/:venueId/aps/:serialNumber/neighbors/query',
    newApi: true
  },
  detectApNeighbors: {
    method: 'PATCH',
    // url: '/venues/aps/:serialNumber/neighbors',
    url: '/venues/:venueId/aps/:serialNumber/neighbors',
    newApi: true
  },
  getCcdSupportVenues: {
    method: 'post',
    url: '/venues/clientConnectionDiagnosis/query',
    newApi: true
  },
  getCcdSupportApGroups: {
    method: 'post',
    url: '/apGroups/clientConnectionDiagnosis/query?venueId=:venueId',
    newApi: true
  },
  runCcd: {
    method: 'post',
    url: '/venues/:venueId/clientConnectionDiagnosis',
    newApi: true
  },

  getApFeatureSets: {
    method: 'post',
    url: '/wifiFeatureSets/query',
    //oldMethod: 'get',
    //OldUrl: '/wifiFeatureSets/:featureName',
    newApi: true
  },
  // replace the getApCompatibilitiesVenue
  getVenueApCompatibilities: {
    method: 'post',
    url: '/venues/apCompatibilities/query',
    newApi: true
  },
  getVenuePreCheckApCompatibilities: {
    method: 'post',
    url: '/venues/apCompatibilities/query?precheck=ture',
    newApi: true
  },
  getApCompatibilities: {
    method: 'post',
    url: '/venues/aps/apCompatibilities/query',
    newApi: true
  },
  // replace the getApCompatibilitiesNetwork
  getNetworkApCompatibilities: {
    method: 'post',
    url: '/wifiNetworks/apCompatibilities/query',
    newApi: true
  },
  activateCertificateTemplate: {
    method: 'PUT',
    newApi: true,
    url: '/wifiNetworks/:networkId/certificateTemplates/:certificateTemplateId'
  },
  activateRadiusServer: {
    method: 'put',
    url: '/wifiNetworks/:networkId/radiusServerProfiles/:radiusId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateRadiusServer: {
    method: 'delete',
    url: '/wifiNetworks/:networkId/radiusServerProfiles/:radiusId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateRadiusServerSettings: {
    method: 'put',
    url: '/wifiNetworks/:networkId/radiusServerProfileSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getRadiusServerSettings: {
    method: 'get',
    url: '/wifiNetworks/:networkId/radiusServerProfileSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateVlanPool: {
    method: 'put',
    url: '/wifiNetworks/:networkId/vlanPoolProfiles/:profileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateVlanPool: {
    method: 'delete',
    url: '/wifiNetworks/:networkId/vlanPoolProfiles/:profileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateApGroupVlanPool: {
    method: 'put',
    url: '/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId/vlanPoolProfiles/:profileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateApGroupVlanPool: {
    method: 'delete',
    url: '/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId/vlanPoolProfiles/:profileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateApLanPortSpecificSettings: {
    method: 'PUT',
    newApi: true,
    url: '/venues/:venueId/aps/:serialNumber/lanPortSpecificSettings',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  bindingPersonaGroupWithNetwork: {
    method: 'PUT',
    url: '/wifiNetworks/:networkId/identityGroups/:identityGroupId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  bindingSpecificIdentityPersonaGroupWithNetwork: {
    method: 'PUT',
    url: '/wifiNetworks/:networkId/identityGroups/:identityGroupId/identities/:identityId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueApIpMode: {
    method: 'GET',
    url: '/venues/:venueId/apIpModeSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueApIpMode: {
    method: 'PUT',
    url: '/venues/:venueId/apIpModeSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}
