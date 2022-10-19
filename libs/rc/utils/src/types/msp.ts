export enum DelegationStatus {
  DELEGATION_STATUS_INVITED = 'DELEGATION_STATUS_INVITED',
  DELEGATION_STATUS_ACCEPTED = 'DELEGATION_STATUS_ACCEPTED'
}

export enum DelegationType {
  DELEGATION_TYPE_SUPPORT = 'DELEGATION_TYPE_SUPPORT',
  DELEGATION_TYPE_VAR = 'DELEGATION_TYPE_VAR'
}

export enum TenantType {
  REC = 'REC', // ("Regular End Customer")
  VAR = 'VAR', // ("Value Added Reseller")
  MSP = 'MSP', // ("Managed Service Provider")
  MSP_EC = 'MSP_EC', // ("MSP-End Customer")
  MSP_NON_VAR = 'MSP_NON_VAR', // ("Disti or Carrier account")
  MSP_INTEGRATOR = 'MSP_INTEGRATOR', // (MSP Integrator)
  MSP_INSTALLER = 'MSP_INSTALLER', // (MSP Installer)
  UNRECOGNIZED = 'UNRECOGNIZED' // ("Un recognised")
}

export enum LicenseBannerTypeEnum {
  initial = 'INITIAL',
  closeToExpiration = 'CLOSE_TO_EXPIRATION',
  gracePeriod = 'GRACE_PERIOD',
  expired = 'AFTER_GRACE_PERIOD',
  msp_expired = 'EXPIRED',
  ra_below_50_percent = 'RA_BELOW_50_PERCENT_OF_DEVICES',
  ra_50_to_90_percent = 'RA_BELOW_90_PERCENT_OF_DEVICES',
  ra_onboard_only = 'RA_ONBOARD_ONLY'
}

export type EntitlementDeviceType =
  'WIFI' | 'LTE' | 'SWITCH' | 'ANALYTICS' | 'MSP_WIFI' | 'MSP_SWITCH'

export enum EntitlementNetworkDeviceType {
  SWITCH = 'DVCNWTYPE_SWITCH',
  WIFI = 'DVCNWTYPE_WIFI',
  LTE = 'DVCNWTYPE_LTE'
}

export enum EntitlementDeviceSubType {
  ICX71L = 'ICX71L',
  ICX71 = 'ICX71',
  ICX75 = 'ICX75',
  ICX76 = 'ICX76',
  ICX78 = 'ICX78',
  ICXTEMP = 'ICXTEMP',
  // for MSP
  ICX_ANY = 'ICX_ANY',
  MSP_WIFI = 'MSP_WIFI',
  MSP_WIFI_TEMP = 'MSP_WIFI_TEMP'
}

export enum DateFormatEnum {
  UserDateFormat = 'MM/DD/YYYY'
}

export interface DelegationEntitlementRecord {
  consumed: string;
  entitlementDeviceType: EntitlementNetworkDeviceType;
  entitlementDeviceSubType?: EntitlementDeviceSubType;
  expirationDate: string;
  quantity: string;
  toBeRemovedQuantity: string;
  tenantId: string;
  type: string;
  subTypeText?: string;
  percentageUsage?: string;
}

export interface MspEc {
  id: string;
  name: string;
  tenantType: string;
  streetAddress: string;
  status: string;
  mspAdminCount: string;
  mspEcAdminCount: string;
  expirationDate: string;
  wifiLicenses: string;
  switchLicens: string;
  assignedMspEcList: string;
  creationDate: number;
  entitlements: DelegationEntitlementRecord[];
}

export interface VarCustomer {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  entitlements: DelegationEntitlementRecord[];
  entitlement: DelegationEntitlementRecord;
}

export interface EcDeviceInventory {
  deviceType: EntitlementNetworkDeviceType;
  venueName: string;
  serialNumber: string;
  switchMac: string;
  name: string;
  tenantId: string;
  apMac: string;
  model: string;
  customerName: string;
  deviceStatus: string;
}

export enum RolesEnum {
  PRIME_ADMIN = 'PRIME_ADMIN',
  ADMINISTRATOR = 'ADMIN',
  GUEST_MANAGER = 'OFFICE_ADMIN',
  READ_ONLY = 'READ_ONLY'
}

export interface MspAdministrator {
  id: string;
  lastName: string;
  name: string;
  email: string;
  role: RolesEnum;
  delegateToAllECs?: boolean;
  detailLevel: string;
}

export interface MspUserSettingType {
  nonVarMspOnboard: boolean;
  mspEcNameChanged: boolean;
}

export interface LicenseAssign {
  deviceSubType: EntitlementDeviceSubType;
  deviceSubTypeText: string;
  totalQuantity: number;
  devicesRemaining: number;
  devicesAssigned: number;
  hasHistory?: boolean;
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
}

export interface MspEntitlementSummary {
  deviceType: EntitlementDeviceType;
  deviceSubType?: EntitlementDeviceSubType;
  derivedLicenseType: string;
  quantity: number;
  courtesyQuantity: number;
  effectiveDate: string;
  expirationDate: string;
  remainingDays: number;
}

export interface EntitlementAssignment {
  mspEcTenantId: string;
  deviceType: EntitlementDeviceType;
  deviceSubType?: EntitlementDeviceSubType;
  quantity: number;
}

export interface MspAssignmentHistory {
  id: number;
  mspEcTenantId: string;
  deviceType: EntitlementDeviceType;
  deviceSubType?: EntitlementDeviceSubType;
  quantity: number;
  dateEffective: string;
  dateExpires: string;
  dateAssignmentCreated: string;
  createdBy: string;
  dateAssignmentRevoked: string;
  revokedBy: string;
  mspTenantId: string;
  trialAssignment: boolean;
}

export interface MspAssignmentSummary {
  deviceType: EntitlementDeviceType;
  deviceSubType?: EntitlementDeviceSubType;
  quantity: number;
  courtesyMspEntitlementsUsed: boolean;
  remainingDevices: number;
  trial: boolean;
}

export interface MspEcAdmin {
  email: string;
  user_name: string;
  full_name: string;
  first_name: string;
  last_name: string;
}

export interface MspEcDeligatedAdmins {
  msp_admin_id: string;
  msp_admin_role: string;
}

export interface EcInvitation {
  admin_email: string;
  resend: boolean;
}
