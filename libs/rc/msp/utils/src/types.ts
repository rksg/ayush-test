import { defineMessage } from 'react-intl'

import {
  Address,
  EntitlementDeviceType,
  EntitlementDeviceSubType,
  EntitlementNetworkDeviceType,
  Entitlement,
  TenantMspEc
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
  toBeRemovedQuantity: number;
  tenantId: string;
  type: string;
  subTypeText?: string;
  percentageUsage?: string;
  outOfComplianceDevices?: number;
  futureOutOfComplianceDevices?: number;
  futureOfComplianceDate?: number;
  wifiDeviceCount?: string;
  switchDeviceCount?: string;
  rwgDeviceCount?: string;
  edgeDeviceCount?: string;
  virtualEdgeDeviceCount?: string;
  iotCtrlDeviceCount?: string;
  availableLicenses?: number;
  adaptivePolicyCount?: number;
  piNetworkCount?: number;
  sisIntegrationCount?: number;
  pmsIntegrationCount?: number;
  hybridCloudSecCount?: number;
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
  integratorCount?: number,
  installerCount?: number,
  expirationDate: string;
  wifiLicenses: string;
  switchLicenses: string;
  apswLicenses: string;
  edgeLicenses?: string;
  assignedMspEcList: string[];
  creationDate: number;
  entitlements: DelegationEntitlementRecord[];
  accountTier?: MspEcTierEnum;
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
  privilege_group_ids?: string[];
  number_of_days?: string;
  isManageAllEcs?: boolean;
  tier?: MspEcTierEnum;
  privacyFeatures?: [{
    featureName?: string,
    status?: string,
    isEnabled?: boolean
  }]
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
  trial: boolean;
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
  ownAssignment?: boolean;
  // RBAC
  licenseType?: string;
  effectiveDate?: string;
  expirationDate?: string;
  isTrial?: boolean,
  createdDate?: string;
  revokedDate?: string;
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
  isManageAllEcs?: boolean;
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
  mspEc?: TenantMspEc;
  msp?: MspTenantData
}

export interface MspTenantData {
  mspLabel?: string;
  myOpenCaseUrl?: string;
  openCaseUrl?: string;
  contactSupportUrl?: string;
  email?: string;
  phone?: string;
  website?: string;
  isDisableNotification?: boolean
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

export interface MspEcAlarmList {
  mspEcAlarmCountList: {
    tenantId?: string;
    alarmCount?: number;
  }[]
}

export interface RecommendFirmwareUpgrade {
  defaultABF: string,
  defaultApBranchFamilyApFirmwares: UpgradeFirmwareVer[]
}

export interface UpgradeFirmwareVer {
  seq: number,
  name: string,
  defaultApFirmware: string,
  branches: string[]
}

export interface RecommendFirmwareUpgradeByApModel {
  id?: string,
  supportedApModels: string[]
}

export interface MspRecData {
  account_id?: string;
  name?: string;
  delegations?: MspIntegratorDelegated[];
  admin_delegations?: MspEcDelegatedAdmins[];
  privilege_group_ids?: string[];
}

export interface MspMultiRecData {
  data: MspRecData[]
  delegations?: MspIntegratorDelegated[];
}

export interface AvailableMspRecCustomers {
  parent_account_name: string,
  parent_account_id?: string,
  child_accounts?: MspRecCustomer[]
  totalPages?: number,
  totalElements: number,
  number: number,
  content: MspRecCustomer[]
}

export interface MspRecCustomer {
  account_name: string,
  account_id?: string,
  billing_street?: string,
  billing_city?: string,
  billing_state?: string,
  billing_postal_code?: string,
  billing_country?: string,
  kumo?: boolean,
  flexera_llm_account_id?: string,
  acx_trial_in_progress?: boolean,
  email_id?: string
  is_tenant_onboarded?: boolean
}

export enum MspEcTierEnum {
  Core = 'Silver',
  Essentials = 'Gold',
  Professional = 'Platinum'
}

export interface MspEcWithVenue extends MspEc {
  isFirstLevel?: boolean,
  isUnauthorizedAccess?: boolean,
  allVenues?: boolean,
  children: {
    name: string,
    id: string,
    selected: boolean
  }[]
}

export interface MspEcTierPayload {
  type: string,
  serviceTierStatus: string
}

export enum DeviceComplianceType {
  WIFI = 'WIFI',
  SWITCH = 'SWITCH',
  EDGE = 'EDGE',
  VIRTUAL_EDGE = 'VIRTUAL_EDGE',
  RWG = 'RWG',
  SLTN_ADAPT_POLICY = 'SLTN_ADAPT_POLICY',
  SLTN_PIN_FOR_IDENTITY = 'SLTN_PIN_FOR_IDENTITY',
  SLTN_PMS_INT = 'SLTN_PMS_INT',
  SLTN_SIS_INT = 'SLTN_SIS_INT',
  SLTN_HYBRID_CLOUD_SEC = 'SLTN_HYBRID_CLOUD_SEC',
  IOT_CTRL = 'IOT_CTRL'
}

export interface SlnTableRow {
  deviceType: DeviceComplianceType,
  installedDeviceCount: number,
  usedLicenseCount: number
}

export const DeviceComplianceTypeLabels = {
  [DeviceComplianceType.WIFI]: defineMessage({ defaultMessage: 'Wifi' }),
  [DeviceComplianceType.SWITCH]: defineMessage({ defaultMessage: 'Switch' }),
  [DeviceComplianceType.EDGE]: defineMessage({ defaultMessage: 'Edge' }),
  [DeviceComplianceType.VIRTUAL_EDGE]: defineMessage({ defaultMessage: 'Virtual Edge' }),
  [DeviceComplianceType.RWG]: defineMessage({ defaultMessage: 'RWG' }),
  [DeviceComplianceType.SLTN_ADAPT_POLICY]: defineMessage({ defaultMessage: 'Adaptive Policy' }),
  [DeviceComplianceType.SLTN_PIN_FOR_IDENTITY]:
    defineMessage({ defaultMessage: 'PIN for RUCKUS One Identity' }),
  [DeviceComplianceType.SLTN_PMS_INT]: defineMessage({ defaultMessage: 'PMS Integration' }),
  [DeviceComplianceType.SLTN_SIS_INT]: defineMessage({ defaultMessage: 'SIS Integration' }),
  [DeviceComplianceType.SLTN_HYBRID_CLOUD_SEC]:
    defineMessage({ defaultMessage: 'Hybrid Cloud Security' }),
  [DeviceComplianceType.IOT_CTRL]:
    defineMessage({ defaultMessage: 'IoT Controllers' })
}

export interface DeviceCompliance {
  deviceType: DeviceComplianceType,
  installedDeviceCount: number,
  usedLicenseCount: number
}

export interface ComplianceData {
  licenseType: string,
  tenantId: string,
  tenantName: string,
  deviceCompliances: DeviceCompliance[]
  totalActivePaidLicenseCount: number,
  totalActiveTrialLicenseCount: number,
  nextPaidExpirationDate: string,
  nextTotalPaidExpiringLicenseCount: number,
  nextTrialExpirationDate: string,
  nextTotalTrialExpiringLicenseCount: number,
  totalActivePaidAssignedLicenseCount: number,
  totalActiveTrialAssignedLicenseCount: number,
  licensesUsed: number,
  licenseGap: number
}

export interface MspCompliances {
  compliances: {
    licenseType: string,
    self?: ComplianceData,
    mspEcSummary?: ComplianceData
  }[]
}

export enum MspEcAccountType {
  PAID = 'PAID',
  TRIAL = 'TRIAL',
  EXTENDED_TRIAL = 'EXTENDED_TRIAL'
}

export interface LicenseCardProps {
  title: string
  subTitle?: string
  data: ComplianceData
  isMsp?: boolean
  trialType?: string,
  footerContent?: React.ReactElement
}

export interface MspLicenseCardProps {
  title: string
  subTitle?: string
  selfData: ComplianceData
  mspData: ComplianceData
  footerContent?: React.ReactElement,
  isExtendedTrial?: boolean
}

export interface LicenseCalculatorCardProps {
  title: string
  subTitle?: string
  footerContent?: React.ReactElement
}

export enum ComplianceMspCustomersDevicesTypes {
  AP='AP',
  SWITCH='SWITCH',
  EDGE='EDGE',
  RWG='RWG',
  SLTN_ADAPT_POLICY='SLTN_ADAPT_POLICY',
  SLTN_PIN_FOR_IDENTITY='SLTN_PIN_FOR_IDENTITY',
  SLTN_PMS_INT='SLTN_PMS_INT',
  SLTN_SIS_INT='SLTN_SIS_INT',
  SLTN_HYBRID_CLOUD_SEC='SLTN_HYBRID_CLOUD_SEC',
  IOT_CONTROLLER='IOT_CONTROLLER'
}

export interface LicenseAttentionNotes {
  data: {
    summary?: string,
    details?: string
  }[]
}

export const MspAttentionNotesPayload = {
  page: 1,
  pageSize: 20,
  fields: ['summary', 'details'],
  sortField: 'status',
  sortOrder: 'DESC',
  filters: {
    type: ['STOP_COURTESY'],
    tenantType: ['MSP', 'ALL'],
    status: ['VALID'],
    licenseCheck: true
  }
}

export const GeneralAttentionNotesPayload = {
  page: 1,
  pageSize: 3,
  fields: ['summary', 'details'],
  sortField: 'endDate',
  sortOrder: 'DESC',
  filters: {
    status: ['VALID'],
    licenseCheck: true
  }
}

export interface LicenseCalculatorData {
    effectiveDate: string,
    expirationDate: string,
    quantity: number,
    licenseType: EntitlementDeviceType,
    isTrial: boolean,
    maxQuantity: number
}

export interface LicenseCalculatorDataResponse {
  data: LicenseCalculatorData,
  message: string
}
export interface SelectedMspMspAdmins {
  mspAdminId: string
  mspAdminRole: RolesEnum
}

export interface AssignedMultiEcMspAdmins {
  operation: string
  mspEcId: string
  mspAdminRoles: SelectedMspMspAdmins[]
  privilege_group_ids?: string[]
}

export interface MileageReportsResponse {
  data: MileageData[],
  pageSize: number,
  page: number,
  totalCount: number
}

export interface MileageData {
  licenseType: EntitlementDeviceType,
  lastDate: string,
  device: number,
  usedQuantity: number,
  quantity: number,
  availableBreakUp: MileageBreakUp[]
}

export interface MileageBreakUp {
  quantity: number,
  expirationDate: string
}

export interface MileageReportsRequestPayload {
  page: number,
  pageSize: number,
  filters: {
      usageType: string,
      licenseType: EntitlementDeviceType
  }
}

export interface MileageSeriesData {
  value: number;
  extraData: MileageBreakUp[];
  isZeroQuantity?: boolean;
}

export const AssignedEntitlementListPayload = {
  fields: [
    'externalId',
    'licenseType',
    'effectiveDate',
    'expirationDate',
    'quantity',
    'sku',
    'licenseDesc',
    'isR1SKU',
    'status',
    'isTrial',
    'graceEndDate',
    'usageType'
  ],
  page: 1,
  pageSize: 1000,
  sortField: 'expirationDate',
  sortOrder: 'DESC',
  filters: {
    usageType: 'ASSIGNED'
  }
}

export interface SolutionTokenSettings {
  featureType: DeviceComplianceType,
  featureName: string,
  maxQuantity: number,
  enabled: boolean,
  capped: boolean,
  licenseToken: number,
  featureCostUnit: string,
  featureUnit: string
}