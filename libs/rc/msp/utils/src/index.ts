import { EntitlementNetworkDeviceType } from '@acx-ui/rc/utils'

import {
  DelegationEntitlementRecord,
  MspEcProfile,
  MspProfile
} from './types'

export * from './types'
export * from './urls'

export const MSP_USER_SETTING = 'COMMON$MSP'

export const MSPUtils = () => {

  const isMspEc = (mspEc: MspEcProfile | undefined): boolean => {
    if (mspEc?.msp_label) {
      return true
    }

    return false
  }

  const isOnboardedMsp = (msp: MspProfile | undefined): boolean => {
    if (msp?.msp_label !== '') {
      return true
    }

    return false
  }

  const transformInstalledDevice = (entitlements: DelegationEntitlementRecord[]) => {
    let installedDevices = 0
    const apswEntitlement = entitlements.filter((en:DelegationEntitlementRecord) =>
      en.entitlementDeviceType === EntitlementNetworkDeviceType.APSW)
    const consumedEntitlements = apswEntitlement.length > 0 ? apswEntitlement : entitlements

    consumedEntitlements.forEach((entitlement:DelegationEntitlementRecord) => {
      const consumed = parseInt(entitlement.consumed, 10)
      installedDevices += consumed
    })
    return installedDevices
  }

  const transformDeviceEntitlement = (entitlements: DelegationEntitlementRecord[]) => {
    let assignedDevices = 0
    const apswEntitlement = entitlements.filter((en:DelegationEntitlementRecord) =>
      en.entitlementDeviceType === EntitlementNetworkDeviceType.APSW)
    const assignedEntitlements = apswEntitlement.length > 0 ? apswEntitlement : entitlements

    assignedEntitlements.forEach((entitlement:DelegationEntitlementRecord) => {
      const quantity = parseInt(entitlement.quantity, 10)
      assignedDevices += quantity
    })
    return assignedDevices
  }

  const transformDeviceUtilization = (entitlements: DelegationEntitlementRecord[]) => {
    let consumed = 0
    let quantity = 0
    const apswEntitlement = entitlements.filter((en:DelegationEntitlementRecord) =>
      en.entitlementDeviceType === EntitlementNetworkDeviceType.APSW)
    const utilizationEntitlements = apswEntitlement.length > 0 ? apswEntitlement : entitlements

    utilizationEntitlements.forEach((entitlement:DelegationEntitlementRecord) => {
      consumed += parseInt(entitlement.consumed, 10)
      quantity += parseInt(entitlement.quantity, 10)
    })
    if (quantity > 0) {
      const value =
      (Math.round(((consumed / quantity) * 10000)) / 100) + '%'
      return value
    } else {
      return '0%'
    }
  }

  return {
    isMspEc,
    isOnboardedMsp,
    transformInstalledDevice,
    transformDeviceEntitlement,
    transformDeviceUtilization
  }
}
