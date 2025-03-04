import { defineMessage } from 'react-intl'

import { RolesEnum } from '@acx-ui/types'

export enum LicenseBannerTypeEnum {
  initial = 'INITIAL',
  closeToExpiration = 'CLOSE_TO_EXPIRATION',
  gracePeriod = 'GRACE_PERIOD',
  expired = 'AFTER_GRACE_PERIOD',
  msp_expired = 'EXPIRED'
}

export enum EntitlementDeviceType {
  WIFI='WIFI',
  LTE='LTE',
  SWITCH='SWITCH',
  APSW='APSW',
  ANALYTICS='ANALYTICS',
  MSP_WIFI='MSP_WIFI',
  MSP_SWITCH='MSP_SWITCH',
  EDGE='EDGE',
  MSP_APSW='MSP_APSW',
  MSP_APSW_TEMP='MSP_APSW_TEMP',
  SLTN_TOKEN='SLTN_TOKEN',
  MSP_SLTN_TOKEN='MSP_SLTN_TOKEN',
  MSP_SLTN_TOKEN_TEMP='MSP_SLTN_TOKEN_TEMP',
}

export enum EntitlementNetworkDeviceType {
  SWITCH = 'DVCNWTYPE_SWITCH',
  WIFI = 'DVCNWTYPE_WIFI',
  LTE = 'DVCNWTYPE_LTE',
  APSW = 'DVCNWTYPE_APSW',
  SLTN_TOKEN = 'DVCNWTYPE_SLTN_TOKEN'
}

export enum EntitlementDeviceSubType {
  ICX71L = 'ICX71L',
  ICX71 = 'ICX71',
  ICX75 = 'ICX75',
  ICX76 = 'ICX76',
  ICX78 = 'ICX78',
  ICX82 = 'ICX82',
  ICXTEMP = 'ICXTEMP',
  ICX = 'ICX',
  // for MSP
  ICX_ANY = 'ICX_ANY',
  MSP_WIFI = 'MSP_WIFI',
  MSP_WIFI_TEMP = 'MSP_WIFI_TEMP'
}

export const roleDisplayText = {
  [RolesEnum.PRIME_ADMIN]: defineMessage({ defaultMessage: 'Prime Admin' }),
  [RolesEnum.ADMINISTRATOR]: defineMessage({ defaultMessage: 'Administrator' }),
  [RolesEnum.GUEST_MANAGER]: defineMessage({ defaultMessage: 'Guest Manager' }),
  [RolesEnum.READ_ONLY]: defineMessage({ defaultMessage: 'Read Only' }),
  [RolesEnum.DPSK_ADMIN]: defineMessage({ defaultMessage: 'DPSK Manager' }),
  [RolesEnum.TEMPLATES_ADMIN]: defineMessage({ defaultMessage: 'Templates Management' }),
  [RolesEnum.REPORTS_ADMIN]: defineMessage({ defaultMessage: 'Reports Admin' })
}

// MSP Entitlement and assignment
export interface MspEntitlement {
  id: string;
  deviceType: EntitlementDeviceType;
  deviceSubType: EntitlementDeviceSubType;
  sku: string;
  quantity: number;
  effectiveDate: string;
  expirationDate: string;
  tenantId: string;
  isTrial: boolean;
  status?: string;
}
