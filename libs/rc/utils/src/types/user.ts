import { MFAStatus, MFAMethod } from '../models/MFAEnum'

import { RolesEnum } from './msp'


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
  role: RolesEnum;
  roles: RolesEnum[];
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
  initials: string;
  fullName: string;
}

export enum DetailLevel {
  BASIC_USER = 'ba',
  IT_PROFESSIONAL = 'it',
  SUPER_USER = 'su',
  DEBUGGING = 'debug'
}

export interface MfaDetailStatus {
  contactId?: string;
  tenantStatus: MFAStatus
  mfaMethods: MFAMethod[]
  recoveryCodes: string[];
  userId: string;
  enabled: boolean;
}

export interface MfaOtpMethod {
  contactId: string;
  method: string;
}

export interface MfaAuthApp {
  key: string;
  url: string;
}

export type GuestErrorRes = {
  error: {
    status: number
    rootCauseErrors: {
      code: string
      message: string
    }[]
  },
  requestId: string,
  request: {
    url: string,
    method: string
  }
}
