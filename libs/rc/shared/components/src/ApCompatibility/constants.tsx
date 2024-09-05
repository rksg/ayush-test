import {
  ApCompatibility,
  ApCompatibilityResponse,
  ApIncompatibleFeature,
  ApIncompatibleDevice
} from '@acx-ui/rc/utils'
export enum ApCompatibilityType {
  NETWORK = 'Network',
  VENUE = 'Venue',
  ALONE = 'ALONE',
}

export enum InCompatibilityFeatures {
  AP_70 = 'WIFI7 302MHz',
  BETA_DPSK3 = 'DSAE',
  AP_NEIGHBORS = 'AP Neighbors',
  BSS_COLORING = 'BSS Coloring',
  QOS_MIRRORING = 'QoS Mirroring',
  TRUNK_PORT_VLAN_UNTAG_ID = 'Trunk Port VLAN Untag Id',
  SD_LAN = 'SD-LAN',
  TUNNEL_PROFILE = 'Tunnel Profile'
}

export const retrievedCompatibilitiesOptions = (
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
