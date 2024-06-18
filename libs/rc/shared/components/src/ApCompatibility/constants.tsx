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
}

export enum ApCompatibilityQueryTypes {
  CHECK_VENUE = 'CHECK_VENUE',
  CHECK_VENUE_WITH_FEATURE = 'CHECK_VENUE_WITH_FEATURE',
  CHECK_VENUE_WITH_APS = 'CHECK_VENUE_WITH_APS',
  CHECK_NETWORKS_OF_VENUE = 'CHECK_NETWORKS_OF_VENUE',

  CHECK_NETWORK = 'CHECK_NETWORK',
  CHECK_NETWORK_WITH_APS = 'CHECK_NETWORK_WITH_APS',
  CHECK_VENUES_OF_NETWORK = 'CHECK_VENUES_OF_NETWORK',
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
