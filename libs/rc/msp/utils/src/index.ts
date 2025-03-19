import moment            from 'moment'
import { defineMessage } from 'react-intl'

import { DateFormatEnum, formatter }    from '@acx-ui/formatter'
import { EntitlementNetworkDeviceType } from '@acx-ui/rc/utils'
import { AccountType }                  from '@acx-ui/utils'

import {
  DelegationEntitlementRecord,
  MspEcAlarmList,
  MspEc,
  MspEcProfile,
  MspProfile,
  MspRecCustomer,
  MspEcAccountType,
  ComplianceMspCustomersDevicesTypes
} from './types'

export * from './types'
export * from './urls'
export * from './mspRbacUrls'
export const MSP_USER_SETTING = 'COMMON$MSP'

export const MSPUtils = () => {

  const isMspEc = (mspEc: MspEcProfile | undefined): boolean => {
    if (mspEc?.msp_label) {
      return true
    }

    return false
  }

  const isOnboardedMsp = (msp: MspProfile | undefined): boolean => {
    if (!!msp?.msp_label) {
      return true
    }

    return false
  }

  const transformInstalledDevice = (entitlements: DelegationEntitlementRecord[],
    licenseTypeSpecific?: EntitlementNetworkDeviceType) => {
    entitlements = entitlements ?? []
    let installedDevices = 0

    let consumedEntitlements

    if (licenseTypeSpecific) {
      consumedEntitlements = entitlements.filter((en:DelegationEntitlementRecord) =>
        en.entitlementDeviceType === licenseTypeSpecific)
    } else {
      const apswEntitlement = entitlements.filter((en:DelegationEntitlementRecord) =>
        en.entitlementDeviceType === EntitlementNetworkDeviceType.APSW)
      consumedEntitlements = apswEntitlement.length > 0 ? apswEntitlement : entitlements
    }

    consumedEntitlements.forEach((entitlement:DelegationEntitlementRecord) => {
      const consumed = parseInt(entitlement.consumed, 10)
      installedDevices += consumed
    })
    return installedDevices
  }

  const transformDeviceEntitlement = (entitlements: DelegationEntitlementRecord[],
    licenseTypeSpecific?: EntitlementNetworkDeviceType) => {
    entitlements = entitlements ?? []
    let assignedDevices = 0
    let assignedEntitlements

    if (licenseTypeSpecific) {
      assignedEntitlements = entitlements.filter((en:DelegationEntitlementRecord) =>
        en.entitlementDeviceType === licenseTypeSpecific)
    } else {
      const apswEntitlement = entitlements.filter((en:DelegationEntitlementRecord) =>
        en.entitlementDeviceType === EntitlementNetworkDeviceType.APSW)
      assignedEntitlements = apswEntitlement.length > 0 ? apswEntitlement : entitlements
    }

    assignedEntitlements.forEach((entitlement:DelegationEntitlementRecord) => {
      const quantity = parseInt(entitlement.quantity, 10)
      assignedDevices += quantity
    })
    return assignedDevices
  }

  const transformAvailableLicenses = (entitlements: DelegationEntitlementRecord[],
    licenseTypeSpecific?: EntitlementNetworkDeviceType
  ) => {
    let availableLicenses = 0
    if (licenseTypeSpecific) {
      entitlements.filter((en:DelegationEntitlementRecord) =>
        en.entitlementDeviceType === licenseTypeSpecific)
        .forEach((entitlement:DelegationEntitlementRecord) => {
          availableLicenses += entitlement?.availableLicenses || 0
        })
    } else {
      entitlements.forEach((entitlement:DelegationEntitlementRecord) => {
        availableLicenses += entitlement?.availableLicenses || 0
      })
    }
    return availableLicenses > 0 ? availableLicenses :
      transformDeviceEntitlement(entitlements, licenseTypeSpecific)
      - transformInstalledDevice(entitlements, licenseTypeSpecific)
  }

  const transformDeviceUtilization = (entitlements: DelegationEntitlementRecord[]) => {
    entitlements = entitlements ?? []
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

  const transformOutOfComplianceDevices = (entitlements: DelegationEntitlementRecord[]) => {
    return entitlements && entitlements.length > 0
      ? (entitlements[0].outOfComplianceDevices || 0) : 0
  }

  const futureOfComplianceDays = (futureOfComplianceDate?: number) => {
    if (!futureOfComplianceDate || isNaN(futureOfComplianceDate)) {
      return '--'
    }
    const Epoch = futureOfComplianceDate - (futureOfComplianceDate % 1000)
    const expirationDate = formatter(DateFormatEnum.DateFormat)(Epoch)
    const newDate = new Date(expirationDate)
    const daysLeft = moment(newDate).diff(moment(), 'days')
    return daysLeft
  }

  const transformFutureOutOfComplianceDevices = (entitlements: DelegationEntitlementRecord[]) => {
    return entitlements && entitlements.length > 0
      ? `${(entitlements[0].futureOutOfComplianceDevices || 0)}
        / ${futureOfComplianceDays(entitlements[0].futureOfComplianceDate)}` : '0 / --'
  }

  const getStatus = (row: MspEc) => {
    if (row.status === 'Active') {
      switch(row.accountType) {
        case MspEcAccountType.TRIAL:
          return defineMessage({ defaultMessage: 'Trial' })
        case MspEcAccountType.EXTENDED_TRIAL:
          return defineMessage({ defaultMessage: 'Extended Trial' })
      }
      return defineMessage({ defaultMessage: 'Active' })
    } else {
      return defineMessage({ defaultMessage: 'Inactive' })
    }
  }

  const transformApEntitlement = (row: MspEc) => {
    return row.wifiLicenses ? row.wifiLicenses : 0
  }

  const transformSwitchEntitlement = (row: MspEc) => {
    return row.switchLicenses ? row.switchLicenses : 0
  }

  const transformUtilization = (row: MspEc, deviceType: EntitlementNetworkDeviceType) => {
    const entitlement = row.entitlements.filter((en:DelegationEntitlementRecord) =>
      en.entitlementDeviceType === deviceType)
    if (entitlement.length > 0) {
      const apEntitlement = entitlement[0]
      const quantity = parseInt(apEntitlement.quantity, 10)
      const consumed = parseInt(apEntitlement.consumed, 10)
      if (quantity > 0) {
        const value =
        (Math.round(((consumed / quantity) * 10000)) / 100) + '%'
        return value
      }
    }
    return '0%'
  }

  const transformCreationDate = (row: MspEc) => {
    const creationDate = row.creationDate
    if (!creationDate || isNaN(creationDate)) {
      return ''
    }
    const Epoch = creationDate - (creationDate % 1000)
    const activeDate = formatter(DateFormatEnum.DateFormat)(Epoch)
    return activeDate
  }

  const transformExpirationDate = (row: MspEc) => {
    let expirationDate = '--'
    const apswEntitlement = row.entitlements.filter((en:DelegationEntitlementRecord) =>
      en.entitlementDeviceType === EntitlementNetworkDeviceType.APSW)

    const entitlements = apswEntitlement.length > 0 ? apswEntitlement : row.entitlements
    let target: DelegationEntitlementRecord
    entitlements.forEach((entitlement:DelegationEntitlementRecord) => {
      const consumed = parseInt(entitlement.consumed, 10)
      const quantity = parseInt(entitlement.quantity, 10)
      if (consumed > 0 || quantity > 0) {
        if (!target || moment(entitlement.expirationDate).isBefore(target.expirationDate)) {
          target = entitlement
        }
      }
      expirationDate = target ? target.expirationDate : '--'
    })
    return expirationDate
  }

  const transformAlarmCount = (row: MspEc, alarmCountData?: MspEcAlarmList) => {
    const count = alarmCountData?.mspEcAlarmCountList?.find(item =>
      item.tenantId === row.id)?.alarmCount
    return (count || 0)
  }

  const transformMspRecAddress = (data: MspRecCustomer) => {
    const address =
    `${data.billing_street}, ${data.billing_city}, ${data.billing_state},
    ${data.billing_postal_code}, ${data.billing_country}`
    return address
  }

  const transformTechPartner = (id: string, techParnersData: MspEc[]) => {
    const rec = techParnersData.find(e => e.id === id)
    return rec?.name ? rec.name : id
  }

  const transformTechPartnerCount = (count?: number) => {
    return count ?? 0
  }

  const transformAdminCount = (data: MspEc, type?: string) => {
    return type === AccountType.MSP_INSTALLER
      ? data.mspInstallerAdminCount || 0 : (type === AccountType.MSP_INTEGRATOR
        ? data.mspIntegratorAdminCount || 0 : data.mspAdminCount || 0)
  }

  const transformAdminCountHeader = (type?: string) => {
    return type === AccountType.MSP_INSTALLER
      ? 'Installer Admin Count'
      : (type === AccountType.MSP_INTEGRATOR
        ? 'Integrator Admin Count' : 'MSP Admin Count')
  }

  const getConfiguredDevices = (deviceType: ComplianceMspCustomersDevicesTypes,
    entitlements: DelegationEntitlementRecord[]) => {
    entitlements = entitlements ?? []

    switch(deviceType) {
      case ComplianceMspCustomersDevicesTypes.AP:
        return entitlements.reduce((sum, en:DelegationEntitlementRecord) =>
          sum + (+(en.wifiDeviceCount || 0)), 0)
      case ComplianceMspCustomersDevicesTypes.SWITCH:
        return entitlements.reduce((sum, en:DelegationEntitlementRecord) =>
          sum + (+(en.switchDeviceCount || 0)), 0)
      case ComplianceMspCustomersDevicesTypes.EDGE:
        return entitlements.reduce((sum, en:DelegationEntitlementRecord) =>
          sum + (+(en.edgeDeviceCount || 0)), 0)
      case ComplianceMspCustomersDevicesTypes.RWG:
        return entitlements.reduce((sum, en:DelegationEntitlementRecord) =>
          sum + (+(en.rwgDeviceCount || 0)), 0)
      case ComplianceMspCustomersDevicesTypes.SLTN_ADAPT_POLICY:
        return entitlements.reduce((sum, en:DelegationEntitlementRecord) =>
          sum + (+(en.adaptivePolicyCount || 0)), 0)
      case ComplianceMspCustomersDevicesTypes.SLTN_PIN_FOR_IDENTITY:
        return entitlements.reduce((sum, en:DelegationEntitlementRecord) =>
          sum + (+(en.piNetworkCount || 0)), 0)
      case ComplianceMspCustomersDevicesTypes.SLTN_SIS_INT:
        return entitlements.reduce((sum, en:DelegationEntitlementRecord) =>
          sum + (+(en.sisIntegrationCount || 0)), 0)
      case ComplianceMspCustomersDevicesTypes.SLTN_PMS_INT:
        return entitlements.reduce((sum, en:DelegationEntitlementRecord) =>
          sum + (+(en.pmsIntegrationCount || 0)), 0)
      case ComplianceMspCustomersDevicesTypes.SLTN_HYBRID_CLOUD_SEC:
        return entitlements.reduce((sum, en:DelegationEntitlementRecord) =>
          sum + (+(en.hybridCloudSecCount || 0)), 0)
      default: return 0
    }
  }

  return {
    isMspEc,
    isOnboardedMsp,
    transformInstalledDevice,
    transformDeviceEntitlement,
    transformAvailableLicenses,
    transformDeviceUtilization,
    transformOutOfComplianceDevices,
    transformFutureOutOfComplianceDevices,
    getStatus,
    transformApEntitlement,
    transformUtilization,
    transformSwitchEntitlement,
    transformCreationDate,
    transformExpirationDate,
    transformAlarmCount,
    transformMspRecAddress,
    transformTechPartner,
    transformTechPartnerCount,
    transformAdminCount,
    transformAdminCountHeader,
    getConfiguredDevices
  }
}
