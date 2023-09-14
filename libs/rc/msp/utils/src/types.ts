import { defineMessage } from 'react-intl'

import {
  Address,
  EntitlementDeviceType,
  EntitlementDeviceSubType,
  EntitlementNetworkDeviceType,
  Entitlement
} from '@acx-ui/rc/utils'
import { RolesEnum } from '@acx-ui/types'


export enum DelegationStatus {
  DELEGATION_STATUS_INVITED = 'DELEGATION_STATUS_INVITED',
  DELEGATION_STATUS_ACCEPTED = 'DELEGATION_STATUS_ACCEPTED'
}

export enum DelegationType {
  DELEGATION_TYPE_SUPPORT = 'DELEGATION_TYPE_SUPPORT',
  DELEGATION_TYPE_VAR = 'DELEGATION_TYPE_VAR'
}

export enum AssignActionEnum {
  ADD = 'ADD',
  MODIFY = 'MODIFY',
  ACTIVATE = 'ACTIVATE'
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
  mspName?: string;
  tenantType: string;
  streetAddress: string;
  status: string;
  accountType?: string;
  mspAdmins?: string[];
  mspAdminCount: string;
  mspEcAdminCount: string;
  mspInstallerAdminCount?: number;
  mspIntegratorAdminCount?: number;
  integrator?: string,
  installer?: string,
  expirationDate: string;
  wifiLicenses: string;
  switchLicenses: string;
  apswLicenses: string;
  edgeLicenses?: string;
  assignedMspEcList: string[];
  creationDate: number;
  entitlements: DelegationEntitlementRecord[];
}

export interface MspEcData {
  id?: string;
  name: string;
  tenant_type?: string,
  address?: Address,
  street_address?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone_number?: string;
  fax_number?: string;
  city?: string;
  mapping_url?: string;
  service_effective_date?: string;
  service_expiration_date?: string;
  is_active?: string;
  tenant_id?: string;
  parent_tenant_id?: string;
  admin_email?: string;
  admin_firstname?: string;
  admin_lastname?: string;
  admin_role?: string;
  licenses?: {};
  delegations?: MspIntegratorDelegated[];
  admin_delegations?: MspEcDelegatedAdmins[];
  number_of_days?: string;
}

export interface VarCustomer {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  wifiLicenses: string;
  switchLicenses: string;
  apswLicenses: string;
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

export enum DateSelectionEnum {
  CUSTOME_DATE = 'CUSTOME_DATE',
  FIVE_YEARS = 'FIVE_YEARS',
  THREE_YEARS = 'THREE_YEARS',
  ONE_YEAR = 'ONE_YEAR',
  NINETY_DAYS = '90_DAYS',
  SIXTY_DAYS = '60_DAYS',
  THIRTY_DAYS = '30_DAYS'
}

export const dateDisplayText = {
  [DateSelectionEnum.CUSTOME_DATE]: defineMessage({ defaultMessage: 'Custom date' }),
  [DateSelectionEnum.FIVE_YEARS]: defineMessage({ defaultMessage: 'Five Years' }),
  [DateSelectionEnum.THREE_YEARS]: defineMessage({ defaultMessage: 'Three Years' }),
  [DateSelectionEnum.ONE_YEAR]: defineMessage({ defaultMessage: 'One Year' }),
  [DateSelectionEnum.NINETY_DAYS]: defineMessage({ defaultMessage: '90 Days' }),
  [DateSelectionEnum.SIXTY_DAYS]: defineMessage({ defaultMessage: '60 Days' }),
  [DateSelectionEnum.THIRTY_DAYS]: defineMessage({ defaultMessage: '30 Days' })
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

export interface MspEntitlementSummary {
  deviceType: EntitlementDeviceType;
  deviceSubType?: EntitlementDeviceSubType;
  derivedLicenseType: string;
  quantity: number;
  courtesyQuantity: number;
  effectiveDate: string;
  expirationDate: string;
  remainingDays: number;
  remainingLicenses: number;
}

export interface NewMspEntitlementSummary {
  mspEntitlementBanners: Array<unknown>;
  mspEntitlements: Entitlement[];
  mspEntitlementSummaries: MspEntitlementSummary[];
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
  status: string;
}

export interface MspAssignmentSummary {
  deviceType: EntitlementDeviceType;
  deviceSubType?: EntitlementDeviceSubType;
  quantity: number;
  courtesyMspEntitlementsUsed: boolean;
  remainingDevices: number;
  trial: boolean;
  myAssignments?: number;
}

export interface MspEcAdmin {
  email: string;
  user_name: string;
  full_name: string;
  first_name: string;
  last_name: string;
}

export interface MspEcDelegatedAdmins {
  msp_admin_id: string;
  msp_admin_role: string;
}

export interface MspIntegratorDelegated {
  mspec_list?: string[];
  delegation_type: string;
  delegation_id?: string;
  number_of_days?: string;
}

export interface EcInvitation {
  admin_email: string;
  resend: boolean;
}

export interface EcProfile {
  name: string;
  msp_label: string;
  is_active: string;
  service_effective_date: string;
  service_expiration_date: string;
  street_address?: string;
  city?: string;
  country?: string;
  state?: string;
  tenant_id?: string;
  parent_tenant_id?: string;
  tenant_type?: string;
}

export interface TenantDetail {
  createdDate?: string;
  entitlementId?: string;
  externalId: string;
  id: string;
  isActivated: boolean
  maintenanceState?: boolean
  name: string;
  oemName?: string;
  ruckusUser?: boolean
  status: string;
  tenantType: string;
  updatedDate?: string;
  upgradeGroup?: string;
}

export interface MspProfile {
  msp_label: string;
  logo_uuid: string;
  msp_fqdn: string;
  contact_support_url: string;
  contact_support_behavior: string;
  open_case_url: string;
  open_case_behavior: string;
  my_open_case_url: string;
  my_open_case_behavior: string;
  change_password_url: string;
  msp_phone: string;
  msp_email: string;
  msp_website:string
}

export interface MspEcProfile {
  msp_label: string;
  name: string;
  street_address: string;
  state: string;
  country: string;
  postal_code: string;
  phone_number: string;
  fax_number: string;
  city: string;
  mapping_url: string;
  service_effective_date: string;
  service_expiration_date: string;
  is_active:string;
  tenant_id:string
  parent_tenant_id:string
}

export interface SupportDelegation {
  id: string;
  type: string;
  status: string;
  createdDate: string;
  delegatedBy: string;
  delegatedTo: string;
  delegatedToName: string;
  expiryDate: string;
  updatedDate: string;
}

export interface AssignedEc {
  delegated_to: string;
  delegation_type: string;
  expiry_date?: string;
  mspec_list: string[];
}

export interface BaseUrl {
  base_url: string;
}

export interface MspPreferredWisprProvider {
  providerName: string;
  apiKey?: string;
  apiSecret?: string;
  customExternalProvider?: boolean;
  auth?: authService;
  acct?: authService;
  externalProviderDisplayName?: string;
}

export interface authService{
    primary?: {
      ip: string;
      port: number;
      sharedSecret?: string;
    };
    secondary?: {
      ip: string;
      port: number;
      sharedSecret?: string;
    };
}

export interface MspPortal {
  msp_label?: string;
  logo_uuid?: string;
  alarm_notification_logo_uuid?: string;
  ping_notification_logo_uuid?: string;
  mlisa_logo_uuid?: string;
  ping_login_logo_uuid?: string;
  default_logo_uuid?: string;
  mspLogoFileDataList?: Array<MspLogoFile>;
  msp_fqdn?: string;
  contact_support_url?: string;
  contact_support_behavior?: string;
  open_case_url?: string;
  open_case_behavior?: string;
  my_open_case_url?: string;
  my_open_case_behavior?: string;
  change_password_url?: string;
  msp_phone?: string;
  msp_email?: string;
  msp_website?: string;
  preferredWisprProvider?: MspPreferredWisprProvider;
}

export interface MspLogoFile {
  id?: string,
  logo_file_name: string,
  logo_fileuuid: string,
  createdDate?: Date,
  updatedDate?: Date
}

export interface ParentLogoUrl {
  logo_url: string
}

export interface MspAggregations {
  aggregation: boolean,
  ecExclusionEnabled: boolean
}