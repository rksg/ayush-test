import { ApiInfo } from '@acx-ui/utils'

// RBAC API
export const WifiConfigUrlsInfo: { [key: string]: ApiInfo } = {
  // ===============================
  // [Radio Tab]
  // ===== wifi radio settings =====
  getVenueDefaultRegulatoryChannels: {
    method: 'get',
    url: '/venues/:venueId/wifiAvailableChannels',
    newApi: true
  },
  getDefaultRadioCustomization: {
    method: 'get',
    url: '/venues/:venueId/apRadioSettings?defaultOnly=true',
    newApi: true
  },

  getVenueApModelBandModeSettings: {
    method: 'get',
    url: '/venues/:venueId/apModelBandModeSettings',
    newApi: true
  },
  updateVenueApModelBandModeSettings: {
    method: 'put',
    url: '/venues/:venueId/apModelBandModeSettings',
    newApi: true
  },
  getApBandModeSettings: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/bandModeSettings',
    newApi: true
  },
  updateApBandModeSettings: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/bandModeSettings',
    newApi: true
  },
  getApBandModeSettingsV1Dot1: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/bandModeSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateApBandModeSettingsV1Dot1: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/bandModeSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getApGroupBandModeSettings: {
    method: 'get',
    url: '/venues/:venueId/apGroups/:apGroupId/apModelBandModeSettings',
    newApi: true
  },
  updateApGroupBandModeSettings: {
    method: 'put',
    url: '/venues/:venueId/apGroups/:apGroupId/apModelBandModeSettings',
    newApi: true
  },
  getVenueRadioCustomization: {
    method: 'get',
    url: '/venues/:venueId/apRadioSettings',
    opsApi: 'GET:/venues/{id}/apRadioSettings',
    newApi: true
  },
  updateVenueRadioCustomization: {
    method: 'put',
    url: '/venues/:venueId/apRadioSettings',
    opsApi: 'PUT:/venues/{id}/apRadioSettings',
    newApi: true
  },
  getApGroupRadioCustomization: {
    method: 'get',
    url: '/venues/:venueId/apGroups/:apGroupId/radioSettings',
    opsApi: 'GET:/venues/{id}/apGroups/{id}/radioSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateApGroupRadioCustomization: {
    method: 'put',
    url: '/venues/:venueId/apGroups/:apGroupId/radioSettings',
    opsApi: 'PUT:/venues/{id}/apGroups/{id}/radioSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getApGroupDefaultRegulatoryChannels: {
    method: 'get',
    url: '/venues/:venueId/apGroups/:apGroupId/wifiAvailableChannels',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getApRadioCustomization: {
    method: 'get',
    //url: '/venues/aps/:serialNumber/radioSettings',
    url: '/venues/:venueId/aps/:serialNumber/radioSettings',
    opsApi: 'GET:/venues/{id}/aps/{id}/radioSettings',
    newApi: true
  },
  updateApRadioCustomization: {
    method: 'put',
    //url: '/venues/aps/:serialNumber/radioSettings',
    url: '/venues/:venueId/aps/:serialNumber/radioSettings',
    opsApi: 'PUT:/venues/{id}/aps/{id}/radioSettings',
    newApi: true
  },
  getApRadioCustomizationV1Dot1: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/radioSettings',
    opsApi: 'GET:/venues/{id}/aps/{id}/radioSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateApRadioCustomizationV1Dot1: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/radioSettings',
    opsApi: 'PUT:/venues/{id}/aps/{id}/radioSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },

  // ===== Load Balancing =====
  getVenueLoadBalancing: {
    method: 'get',
    // url: '/venues/:venueId/loadBalancingSettings',
    url: '/venues/:venueId/apLoadBalancingSettings',
    opsApi: 'GET:/venues/{id}/apLoadBalancingSettings',
    newApi: true
  },
  updateVenueLoadBalancing: {
    method: 'put',
    // url: '/venues/:venueId/loadBalancingSettings',
    url: '/venues/:venueId/apLoadBalancingSettings',
    opsApi: 'PUT:/venues/{id}/apLoadBalancingSettings',
    newApi: true
  },

  // ==== Client Admission Control =====
  getVenueClientAdmissionControl: {
    method: 'get',
    // url: '/venues/:venueId/clientAdmissionControlSettings',
    url: '/venues/:venueId/apClientAdmissionControlSettings',
    opsApi: 'GET:/venues/{id}/apClientAdmissionControlSettings',
    newApi: true
  },
  updateVenueClientAdmissionControl: {
    method: 'put',
    // url: '/venues/:venueId/clientAdmissionControlSettings',
    url: '/venues/:venueId/apClientAdmissionControlSettings',
    opsApi: 'PUT:/venues/{id}/apClientAdmissionControlSettings',
    newApi: true
  },
  getApClientAdmissionControl: {
    method: 'get',
    // url: '/venues/aps/:serialNumber/clientAdmissionControlSettings',
    url: '/venues/:venueId/aps/:serialNumber/clientAdmissionControlSettings',
    opsApi: 'GET:/venues/{id}/aps/{id}/clientAdmissionControlSettings',
    newApi: true
  },
  updateApClientAdmissionControl: {
    method: 'put',
    // url: '/venues/aps/:serialNumber/clientAdmissionControlSettings',
    url: '/venues/:venueId/aps/:serialNumber/clientAdmissionControlSettings',
    opsApi: 'PUT:/venues/{id}/aps/{id}/clientAdmissionControlSettings',
    newApi: true
  },

  // ===== Antenna =====
  getVenueExternalAntenna: {
    method: 'get',
    url: '/venues/:venueId/apModelExternalAntennaSettings',
    opsApi: 'GET:/venues/{id}/apModelExternalAntennaSettings',
    newApi: true
  },
  updateVenueExternalAntenna: {
    method: 'put',
    url: '/venues/:venueId/apModelExternalAntennaSettings',
    opsApi: 'PUT:/venues/{id}/apModelExternalAntennaSettings',
    newApi: true
  },

  getVenueAntennaType: {
    method: 'get',
    url: '/venues/:venueId/apModelAntennaTypeSettings',
    opsApi: 'GET:/venues/{id}/apModelAntennaTypeSettings',
    newApi: true
  },
  updateVenueAntennaType: {
    method: 'put',
    url: '/venues/:venueId/apModelAntennaTypeSettings',
    opsApi: 'PUT:/venues/{id}/apModelAntennaTypeSettings',
    newApi: true
  },
  getApAntennaTypeSettings: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/antennaTypeSettings',
    opsApi: 'GET:/venues/{id}/aps/{id}/antennaTypeSettings',
    newApi: true
  },
  updateApAntennaTypeSettings: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/antennaTypeSettings',
    opsApi: 'PUT:/venues/{id}/aps/{id}/antennaTypeSettings',
    newApi: true
  },

  // ===== Client Steering  (AP only) =====
  getApStickyClientSteering: {
    method: 'GET',
    newApi: true,
    url: '/venues/:venueId/aps/:serialNumber/stickyClientSteeringSettings',
    opsApi: 'GET:/venues/{id}/aps/{id}/stickyClientSteeringSettings',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateApStickyClientSteering: {
    method: 'PUT',
    newApi: true,
    url: '/venues/:venueId/aps/:serialNumber/stickyClientSteeringSettings',
    opsApi: 'PUT:/venues/{id}/aps/{id}/stickyClientSteeringSettings',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  resetApStickyClientSteering: {
    method: 'DELETE',
    newApi: true,
    url: '/venues/:venueId/aps/:serialNumber/stickyClientSteeringSettings',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },


  // ===============================
  // [Networking Tab]
  // ===== LAN Port settings =====
  getDefaultVenueLanPorts: {
    method: 'get',
    url: '/venues/:venueId/apModelLanPortSettings?defaultOnly=true',
    newApi: true
  },
  getVenueLanPorts: {
    method: 'get',
    //url: '/venues/:venueId/lanPortSettings',
    url: '/venues/:venueId/apModelLanPortSettings',
    opsApi: 'GET:/venues/{id}/apModelLanPortSettings',
    newApi: true
  },
  updateVenueLanPorts: {
    method: 'put',
    //url: '/venues/:venueId/lanPortSettings',
    url: '/venues/:venueId/apModelLanPortSettings',
    opsApi: 'PUT:/venues/{id}/apModelLanPortSettings',
    newApi: true
  },
  getDefaultApLanPorts: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/lanPortSettings?defaultOnly=true',
    newApi: true
  },
  getApLanPorts: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/lanPortSettings',
    opsApi: 'GET:/venues/{id}/aps/{id}/lanPortSettings',
    newApi: true
  },
  updateApLanPorts: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/lanPortSettings',
    opsApi: 'PUT:/venues/{id}/aps/{id}/lanPortSettings',
    newApi: true
  },

  // ===== Mesh Network =====
  getVenueMesh: {
    method: 'get',
    url: '/venues/:venueId/apMeshSettings',
    opsApi: 'GET:/venues/{id}/apMeshSettings',
    newApi: true
  },
  updateVenueMesh: {
    method: 'put',
    // url: '/venues/:venueId/meshSettings',
    url: '/venues/:venueId/apMeshSettings',
    opsApi: 'PUT:/venues/{id}/apMeshSettings',
    newApi: true
  },
  getMeshAps: {
    method: 'post',
    // url: '/aps/query?mesh=true',
    url: '/venues/aps/query?mesh=true',
    newApi: true
  },
  getApMeshSettings: {
    method: 'get',
    // url: '/venues/aps/:serialNumber/meshSettings',
    url: '/venues/:venueId/aps/:serialNumber/meshSettings',
    opsApi: 'GET:/venues/{id}/aps/{id}/meshSettings',
    newApi: true
  },
  updateApMeshSettings: {
    method: 'put',
    // url: '/venues/aps/:serialNumber/meshSettings',
    url: '/venues/:venueId/aps/:serialNumber/meshSettings',
    opsApi: 'PUT:/venues/{id}/aps/{id}/meshSettings',
    newApi: true
  },
  /*
  // deprecate!! Using the POST /venues/aps/query with the meshStatus.meshNeighbors field to replace
  getMeshUplinkAPs: {
    method: 'post',
    url: '/aps/neighbors/query',
    newApi: true
  },
  */


  // ===== Directed Multicast =====
  getVenueDirectedMulticast: {
    method: 'get',
    //url: '/venues/:venueId/directedMulticastSettings',
    url: '/venues/:venueId/apDirectedMulticastSettings',
    opsApi: 'GET:/venues/{id}/apDirectedMulticastSettings',
    newApi: true
  },
  updateVenueDirectedMulticast: {
    method: 'put',
    //url: '/venues/:venueId/directedMulticastSettings',
    url: '/venues/:venueId/apDirectedMulticastSettings',
    opsApi: 'PUT:/venues/{id}/apDirectedMulticastSettings',
    newApi: true
  },
  getApDirectedMulticast: {
    method: 'get',
    //url: '/venues/aps/:serialNumber/directedMulticastSettings',
    url: '/venues/:venueId/aps/:serialNumber/directedMulticastSettings',
    opsApi: 'GET:/venues/{id}/aps/{id}/directedMulticastSettings',
    newApi: true
  },
  updateApDirectedMulticast: {
    method: 'put',
    //url: '/venues/aps/:serialNumber/directedMulticastSettings',
    url: '/venues/:venueId/aps/:serialNumber/directedMulticastSettings',
    opsApi: 'PUT:/venues/{id}/aps/{id}/directedMulticastSettings',
    newApi: true
  },
  /*
  // deprecated. use the updateApDirectedMulticast to replace
  resetApDirectedMulticast: {
    method: 'delete',
    //url: '/venues/aps/:serialNumber/directedMulticastSettings',
    url: '/venues/:venueId/aps/:serialNumber/directedMulticastSettings',
    newApi: true
  },
  */

  // ===== Cellular settings (Venue only) =====
  getAvailableLteBands: {
    method: 'get',
    //url: '/venues/lteBands',
    url: '/venues/apAvailableLteBands',
    newApi: true
  },
  getVenueApModelCellular: {
    method: 'get',
    //url: '/venues/:venueId/cellularSettings',
    url: '/venues/:venueId/apCellularSettings',
    opsApi: 'GET:/venues/{id}/apCellularSettings',
    newApi: true
  },
  updateVenueCellularSettings: {
    method: 'put',
    //url: '/venues/:venueId/cellularSettings',
    url: '/venues/:venueId/apCellularSettings',
    opsApi: 'PUT:/venues/{id}/apCellularSettings',
    newApi: true
  },

  // ===== Smart Monitor =====
  getVenueSmartMonitor: {
    method: 'get',
    url: '/venues/:venueId/apSmartMonitorSettings',
    opsApi: 'GET:/venues/{id}/apSmartMonitorSettings',
    newApi: true
  },
  updateVenueSmartMonitor: {
    method: 'put',
    url: '/venues/:venueId/apSmartMonitorSettings',
    opsApi: 'PUT:/venues/{id}/apSmartMonitorSettings',
    newApi: true
  },
  getApSmartMonitor: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/smartMonitorSettings',
    opsApi: 'GET:/venues/{id}/aps/{id}/smartMonitorSettings',
    newApi: true
  },
  updateApSmartMonitor: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/smartMonitorSettings',
    opsApi: 'PUT:/venues/{id}/aps/{id}/smartMonitorSettings',
    newApi: true
  },

  // ===== RADIUS Option (Venue only) =====
  getVenueRadiusOptions: {
    method: 'get',
    //url: '/venues/:venueId/radiusOptions',
    url: '/venues/:venueId/apRadiusOptions',
    opsApi: 'GET:/venues/{id}/apRadiusOptions',
    newApi: true
  },
  updateVenueRadiusOptions: {
    method: 'put',
    //url: '/venues/:venueId/radiusOptions',
    url: '/venues/:venueId/apRadiusOptions',
    opsApi: 'PUT:/venues/{id}/apRadiusOptions',
    newApi: true
  },

  // ===== IP settings (AP only) =====
  getApNetworkSettings: {
    method: 'get',
    // url: '/venues/aps/:serialNumber/networkSettings',
    url: '/venues/:venueId/aps/:serialNumber/networkSettings',
    opsApi: 'GET:/venues/{id}/aps/{id}/networkSettings',
    newApi: true
  },
  updateApNetworkSettings: {
    method: 'put',
    // url: '/venues/aps/:serialNumber/networkSettings',
    url: '/venues/:venueId/aps/:serialNumber/networkSettings',
    opsApi: 'PUT:/venues/{id}/aps/{id}/networkSettings',
    newApi: true
  },
  /*
  // deprecated. use the updateApNetworkSettings to replace
  resetApNetworkSettings: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/networkSettings',
    newApi: true
  },
  */


  // ===============================
  // [Security Tab] - Venue Only
  // ===== DoS Protection =====
  getDenialOfServiceProtection: {
    method: 'get',
    // url: '/venues/:venueId/dosProtectionSettings',
    url: '/venues/:venueId/apDosProtectionSettings',
    opsApi: 'GET:/venues/{id}/apDosProtectionSettings',
    newApi: true
  },
  updateDenialOfServiceProtection: {
    method: 'put',
    // url: '/venues/:venueId/dosProtectionSettings',
    url: '/venues/:venueId/apDosProtectionSettings',
    opsApi: 'PUT:/venues/{id}/apDosProtectionSettings',
    newApi: true
  },

  // ===== Rogue AP Detection =====
  getVenueRogueAp: {
    method: 'get',
    url: '/venues/:venueId/roguePolicySettings',
    opsApi: 'GET:/venues/{id}/roguePolicySettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueRogueAp: {
    method: 'put',
    url: '/venues/:venueId/roguePolicySettings',
    opsApi: 'PUT:/venues/{id}/roguePolicySettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },


  // ===============================
  // [Network Control Tab]
  // ===== Syslog (Venue Only) =====
  // The APIs defined into the SyslogUrls.ts

  // ===== mDNS Fencing (Venue Only) =====
  getVenueMdnsFencingPolicy: {
    method: 'get',
    //url: '/venues/:venueId/mDnsFencingSettings',
    url: '/venues/:venueId/apMulticastDnsFencingSettings',
    opsApi: 'GET:/venues/{id}/apMulticastDnsFencingSettings',
    newApi: true
  },
  updateVenueMdnsFencingPolicy: {
    method: 'put',
    //url: '/venues/:venueId/mDnsFencingSettings',
    url: '/venues/:venueId/apMulticastDnsFencingSettings',
    opsApi: 'PUT:/venues/{id}/apMulticastDnsFencingSettings',
    newApi: true
  },

  // ===== mDNS Proxy (AP Only) =====
  // The APIs defined into the MdnsProxyUrls.ys

  // ===== SNMP =====
  // The APIs defined into the apSnmpRbacUrls.ts

  // ===== IoT =====
  getVenueIot: {
    method: 'get',
    url: '/venues/:venueId/apIotSettings',
    opsApi: 'GET:/venues/{id}/apIotSettings',
    newApi: true
  },
  updateVenueIot: {
    method: 'put',
    url: '/venues/:venueId/apIotSettings',
    opsApi: 'PUT:/venues/{id}/apIotSettings',
    newApi: true
  },
  getApIot: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/iotSettings',
    opsApi: 'GET:/venues/{id}/aps/{id}/iotSettings',
    newApi: true
  },
  updateApIot: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/iotSettings',
    opsApi: 'PUT:/venues/{id}/aps/{id}/iotSettings',
    newApi: true
  },

  // ===== Location Based Service (Venue Only) =====
  // The APIs defined into the lbsServerProfileUrls.ys


  // ===============================
  // [Advanced Tab]
  // ===== LED settings =====
  getVenueLedOn: {
    method: 'get',
    // url: '/venues/:venueId/ledSettings',
    url: '/venues/:venueId/apModelLedSettings',
    opsApi: 'GET:/venues/{id}/apModelLedSettings',
    newApi: true
  },
  updateVenueLedOn: {
    method: 'put',
    // url: '/venues/:venueId/ledSettings',
    url: '/venues/:venueId/apModelLedSettings',
    opsApi: 'PUT:/venues/{id}/apModelLedSettings',
    newApi: true
  },
  getApLed: {
    method: 'get',
    // url: '/venues/aps/:serialNumber/ledSettings',
    url: '/venues/:venueId/aps/:serialNumber/ledSettings',
    opsApi: 'GET:/venues/{id}/aps/{id}/ledSettings',
    newApi: true
  },
  updateApLed: {
    method: 'put',
    // url: '/venues/aps/:serialNumber/ledSettings',
    url: '/venues/:venueId/aps/:serialNumber/ledSettings',
    opsApi: 'PUT:/venues/{id}/aps/{id}/ledSettings',
    newApi: true
  },

  // ===== USB settings =====
  getVenueApUsbStatus: {
    method: 'get',
    url: '/venues/:venueId/apModelUsbPortSettings',
    opsApi: 'GET:/venues/{id}/apModelUsbPortSettings',
    newApi: true
  },
  updateVenueApUsbStatus: {
    method: 'put',
    url: '/venues/:venueId/apModelUsbPortSettings',
    opsApi: 'PUT:/venues/{id}/apModelUsbPortSettings',
    newApi: true
  },
  getApUsb: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/usbPortSettings',
    opsApi: 'GET:/venues/{id}/aps/{id}/usbPortSettings',
    newApi: true
  },
  updateApUsb: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/usbPortSettings',
    opsApi: 'PUT:/venues/{id}/aps/{id}/usbPortSettings',
    newApi: true
  },

  // ===== BSS Coloring =====
  getVenueBssColoring: {
    method: 'get',
    // url: '/venues/:venueId/bssColoringSettings',
    url: '/venues/:venueId/apBssColoringSettings',
    opsApi: 'GET:/venues/{id}/apBssColoringSettings',
    newApi: true
  },
  updateVenueBssColoring: {
    method: 'put',
    // url: '/venues/:venueId/bssColoringSettings',
    url: '/venues/:venueId/apBssColoringSettings',
    opsApi: 'PUT:/venues/{id}/apBssColoringSettings',
    newApi: true
  },
  getApBssColoring: {
    method: 'get',
    // url: '/venues/aps/:serialNumber/bssColoringSettings',
    url: '/venues/:venueId/aps/:serialNumber/bssColoringSettings',
    opsApi: 'GET:/venues/{id}/aps/{id}/bssColoringSettings',
    newApi: true
  },
  updateApBssColoring: {
    method: 'put',
    // url: '/venues/aps/:serialNumber/bssColoringSettings',
    url: '/venues/:venueId/aps/:serialNumber/bssColoringSettings',
    opsApi: 'PUT:/venues/{id}/aps/{id}/bssColoringSettings',
    newApi: true
  },

  // ===== Management Vlan =====
  getVenueApManagementVlan: {
    method: 'get',
    url: '/venues/:venueId/apManagementTrafficVlanSettings',
    opsApi: 'GET:/venues/{id}/apManagementTrafficVlanSettings',
    newApi: true
  },
  updateVenueApManagementVlan: {
    method: 'put',
    url: '/venues/:venueId/apManagementTrafficVlanSettings',
    opsApi: 'PUT:/venues/{id}/apManagementTrafficVlanSettings',
    newApi: true
  },
  getApManagementVlan: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/managementTrafficVlanSettings',
    opsApi: 'GET:/venues/{id}/aps/{id}/managementTrafficVlanSettings',
    newApi: true
  },
  updateApManagementVlan: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/managementTrafficVlanSettings',
    opsApi: 'PUT:/venues/{id}/aps/{id}/managementTrafficVlanSettings',
    newApi: true
  },

  // ===== RebootTimeout (Venue only) =====
  getVenueRebootTimeout: {
    method: 'get',
    url: '/venues/:venueId/apRebootTimeoutSettings',
    opsApi: 'GET:/venues/{id}/apRebootTimeoutSettings',
    newApi: true
  },
  updateVenueRebootTimeout: {
    method: 'put',
    url: '/venues/:venueId/apRebootTimeoutSettings',
    opsApi: 'PUT:/venues/{id}/apRebootTimeoutSettings',
    newApi: true
  }
}
