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
    ICXTEMP = 'ICXTEMP'
  }
  
export interface DelegationEntitlementRecord {
    consumed: string;
    entitlementDeviceType: EntitlementNetworkDeviceType;
    entitlementDeviceSubType?: EntitlementDeviceSubType;
    expirationDate: string;
    quantity: string;
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
  
export interface EcDeviceInventory {
    deviceType: string;
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