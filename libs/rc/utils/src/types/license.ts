import {
  EntitlementDeviceType,
  EntitlementDeviceSubType
} from './msp'


export interface Entitlement {
  id: string;
  deviceType: EntitlementDeviceType;
  deviceSubType: EntitlementDeviceSubType;
  sku: string;
  quantity: number;
  createdDate: string;
  effectiveDate: string;
  expirationDate: string;
  graceEndDate: string;
}

export interface EntitlementBanner {
  deviceCount: number;
  deviceSubType: EntitlementDeviceSubType;
  deviceType: EntitlementDeviceType;
  effectDate: string;
  effectDays: number;
  multipleLicense: boolean;
  totalActiveDevices: 0;
  totalRALicense:0;
}


export interface EntitlementSummary {
  deviceType: EntitlementDeviceType;
  deviceSubType?: EntitlementDeviceSubType;
  quantity: number;
  effectiveDate: string;
  expirationDate: string;
  remainingDays: number;
}
