import {
  ApCompatibility,
  ApCompatibilityResponse,
  ApIncompatibleFeature,
  ApIncompatibleDevice,
  CompatibilityResponse,
  Compatibility,
  IncompatibleFeature
} from '@acx-ui/rc/utils'
export enum ApCompatibilityType {
  NETWORK = 'Network',
  VENUE = 'Venue',
  ALONE = 'ALONE',
}

export enum InCompatibilityFeatures {
  AFC = 'AFC',
  AP_70 = 'WIFI7 302MHz',
  BANDWIDTH_320MHZ = 'WIFI7 320MHz',
  BETA_DPSK3 = 'DSAE',
  AUTO_CELL_SIZING = 'Auto Cell Sizing',
  AIRTIME_DECONGESTION = 'Airtime Decongestion',
  AP_NEIGHBORS = 'AP Neighbors',
  BSS_COLORING = 'BSS Coloring',
  BSS_PRIORITY = 'BSS Priority',
  OUTDOOR_6G_CHANNEL = '6G outdoor channels',
  JOIN_RSSI_THRESHOLD = 'Join RSSI Threshold',
  LOCATION_BASED_SERVICE = 'Location Based Service',
  MAC_AUTH = 'MAC Authentication',
  MLO_3R = 'WIFI7 3 Links For Multi Link Operation',
  NETWORK_MULTICAST_RATE_LIMIT = 'Multicast Rate Limit (Network)',
  QOS_MIRRORING = 'QoS Mirroring',
  SMART_MONITOR = 'Smart Monitor',
  SOFT_GRE = 'Soft GRE',
  BAND_MANAGEMENT = 'Band Management',
  TRUNK_PORT_VLAN_UNTAG_ID = 'Trunk Port VLAN Untag Id',
  SD_LAN = 'SD-LAN',
  TUNNEL_PROFILE = 'Tunnel Profile',
  VENUE_MULTICAST_RATE_LIMIT = 'Multicast Rate Limit (Venue)',
  OWE_TRANSITION_6G = 'OWE Transition 6G',
  MESH_5G_ONLY_6G_ONLY = 'Mesh 5G Only And 6G Only'
}

export const retrievedApCompatibilitiesOptions = (
  response?: ApCompatibilityResponse
) => {
  const data = response?.apCompatibilities as ApCompatibility[]
  const compatibilitiesFilterOptions: {
    key: string;
    value: string;
    label: string;
  }[] = []
  if (data?.[0]) {
    const { incompatibleFeatures, incompatible } = data[0]
    if (incompatible > 0) {
      incompatibleFeatures?.forEach((feature: ApIncompatibleFeature) => {
        const { featureName, incompatibleDevices } = feature
        const fwVersions: string[] = []
        incompatibleDevices?.forEach((device: ApIncompatibleDevice) => {
          if (fwVersions.indexOf(device.firmware) === -1) {
            fwVersions.push(device.firmware)
          }
        })
        compatibilitiesFilterOptions.push({
          key: fwVersions.join(','),
          value: featureName,
          label: featureName
        })
      })
    }
    return {
      compatibilitiesFilterOptions,
      apCompatibilities: data,
      incompatible
    }
  }
  return {
    compatibilitiesFilterOptions,
    apCompatibilities: data,
    incompatible: 0
  }
}

export const retrievedCompatibilitiesOptions = (
  response?: CompatibilityResponse
) => {
  const data = response?.compatibilities as Compatibility[]
  const compatibilitiesFilterOptions: {
    key: string;
    value: string;
    label: string;
  }[] = []

  if (data?.[0]) {
    const { incompatibleFeatures, incompatible } = data[0]
    if (incompatible > 0) {
      incompatibleFeatures?.forEach((feature: IncompatibleFeature) => {
        const { featureName, incompatibleDevices } = feature
        const keys: string[] = []
        incompatibleDevices?.forEach((device: ApIncompatibleDevice) => {
          //const { firmware, model } = device
          //const key = `${firmware}_${model}`
          const { firmware: key } = device
          if (!keys.includes(key)) {
            keys.push(key)
          }
        })
        compatibilitiesFilterOptions.push({
          key: keys.join(','),
          value: featureName,
          label: featureName
        })
      })
    }

    return {
      compatibilitiesFilterOptions,
      apCompatibilities: data,
      incompatible
    }
  }

  return {
    compatibilitiesFilterOptions,
    apCompatibilities: data,
    incompatible: 0
  }
}
