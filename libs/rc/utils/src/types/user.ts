export interface UserSettings {
  [key: string]: string
}

export interface RegionValue {
  name: string;
  description: string;
  link: string;
  current: boolean;
}

export interface UserProfile {
  region: string;
  swuId: string;
  pver: string;
  companyName: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  roles: string[];
  detailLevel: DetailLevel;
  dateFormat: string;
  var: boolean;
  support: boolean;
  varTenantId?: string;
  switchEnabled: boolean;
  wifiEnabled: boolean;
  dogfood: boolean;
  delegatedDogfood: boolean;
  lteEnabled: boolean;
  allowedRegions: RegionValue[];
  tenantId: string;
  adminId: string;
  externalId: string;
  cloudCertStatus: string;
  email: string;
}

export interface ProfileDataToUpdate {
  detailLevel: DetailLevel;
  dateFormat: string;
}

export enum DetailLevel {
  BASIC_USER = 'ba',
  IT_PROFESSIONAL = 'it',
  SUPER_USER = 'su',
  DEBUGGING = 'debug'
}
