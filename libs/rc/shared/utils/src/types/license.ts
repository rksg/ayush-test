import {
  EntitlementDeviceType,
  EntitlementDeviceSubType,
  LicenseBannerTypeEnum
} from './msp'


export interface LicenseEntitlement {
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

export interface EntitlementBannersData {
  data: EntitlementBanner[];
}

export interface EntitlementBanner {
  licenseCount: number;
  licenseType: EntitlementDeviceType;
  effectDate: string;
  effectiveDays: number;
  multipleLicense: boolean;
  type: LicenseBannerTypeEnum;
}

export interface EntitlementSummaries {
  quantity: number;
  purchasedQuantity: number,
  courtesyQuantity: number,
  usedQuantity: number,
  usedQuantityForOwnAssignment: number,
  isTrial: boolean,
  licenseType: EntitlementDeviceType,
  remainingLicenses: number,
  usageType: string
}

export interface RbacEntitlementSummary {
  data: EntitlementSummaries[];
}

export enum TrialType {
  TRIAL = 'TRIAL',
  EXTENDED_TRIAL = 'EXTENDED_TRIAL'
}