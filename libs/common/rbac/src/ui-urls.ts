export interface ApiInfo {
  url: string;
  method: string;
}

export const MainUiUrlsInfo: { [key: string]: ApiInfo } = {
  getMspEcDelegations: {
    method: 'get',
    url: '/api/tenant/{tenantId}/delegation?type=MSP'
  },
  enableAccessSupport: {
    method: 'post',
    url: '/api/tenant/{tenantId}/delegation/support'
  },
  disableAccessSupport: {
    method: 'delete',
    url: '/api/tenant/{tenantId}/delegation/support'
  },
  getTenantDelegation: {
    method: 'get',
    url: '/api/tenant/{tenantId}/delegation?type=SUPPORT'
  },
  getEcTenantDelegation: {
    method: 'get',
    url: '/api/tenant/{tenantId}/delegation?type=SUPPORT_EC'
  },
  getRecoveryPassphrase: {
    method: 'get',
    url: '/api/tenant/{tenantId}/wifi/recovery'
  },
  updateRecoveryPassphrase: {
    method: 'put',
    url: '/api/tenant/{tenantId}/wifi/recovery'
  },
  getRegisteredUsersList: {
    method: 'get',
    url: '/api/tenant/{tenantId}/admins/registered'
  },
  deleteAdmin: {
    method: 'delete',
    url: '/api/tenant/{tenantId}/admin/{adminId}'
  },
  deleteAdmins: {
    method: 'delete',
    url: '/api/tenant/{tenantId}/admin'
  },
  getNotificationRecipients: {
    method: 'get',
    url: '/api/tenant/{tenantId}/notification-recipient'
  },
  addAdmin: {
    method: 'post',
    url: '/api/tenant/{tenantId}/admin'
  },
  addRecipient: {
    method: 'post',
    url: '/api/tenant/{tenantId}/notification-recipient'
  },
  updateRecipient: {
    method: 'put',
    url: '/api/tenant/{tenantId}/notification-recipient/{recipientId}'
  },
  deleteNotificationRecipients: {
    method: 'delete',
    url: '/api/tenant/{tenantId}/notification-recipient'
  },
  deleteNotificationRecipient: {
    method: 'delete',
    url: '/api/tenant/{tenantId}/notification-recipient/{recipientId}'
  },
  getAccountDetails: {
    method: 'get',
    url: '/api/tenant/{tenantId}/account'
  },
  getCloudVersion: {
    method: 'get',
    url: '/api/upgrade/tenant/{tenantId}/upgrade-version'
  },
  getCloudVersionList: {
    method: 'post',
    url: '/api/upgrade/tenant/{tenantId}/upgrade-version-details'
  },
  getCloudScheduleVersion: {
    method: 'get',
    url: '/api/tenant/{tenantId}/wifi/upgrade/schedule-version'
  },
  getIntegratorsCloudVersionList: {
    method: 'post',
    url: '/api/upgrade/tenant/{tenantId}/integrator-installer-upgrade-details'
  },
  getAvailableSlots: {
    method: 'get',
    url: '/api/upgrade/tenant/{tenantId}/slot'
  },
  getSelectedSlot: {
    method: 'get',
    url: '/api/upgrade/tenant/{tenantId}/slot/selected'
  },
  updateSlot: {
    method: 'put',
    url: '/api/upgrade/tenant/{tenantId}'
  },
  getCloudReachability: {
    method: 'get',
    url: '/api/eventalarmapi/{tenantId}/alarm/cloud-reachability'
  },
  getEcgiRecords: {
    method: 'post',
    url: '/api/viewmodel/tenant/{tenantId}/lte/ecgi-record'
  },
  addEcgiRecord: {
    method: 'post',
    url: '/api/tenant/{tenantId}/lte/ecgi-record'
  },
  updateEcgiRecord: {
    method: 'put',
    url: '/api/tenant/{tenantId}/lte/ecgi-record/{ecgiRecordId}'
  },
  getAvailableECGIs: {
    method: 'post',
    url: '/api/tenant/{tenantId}/lte/ecgi-record/availability'
  },
  deleteEcgiRecord: {
    method: 'delete',
    url: '/api/tenant/{tenantId}/lte/ecgi-record'
  },
  getTenantEntitlementSummary: {
    method: 'get',
    url: '/api/tenant/{tenantId}/entitlement/summary'
  },
  getLicensesSummary: {
    method: 'get',
    url: '/api/tenant/{tenantId}/entitlement/summary'
  },
  getMspLicensesSummary: {
    method: 'get',
    url: '/api/entitlement-assign/tenant/{tenantId}/mspEntitlementSummary'
  },
  getMspLicensesAssignSummary: {
    method: 'get',
    url: '/api/entitlement-assign/tenant/{tenantId}/assignment/summary'
  },
  getMspEntitlementsList: {
    method: 'get',
    url: '/api/entitlement-assign/tenant/{tenantId}/mspEntitlement'
  },
  getMspLicensesBanners: {
    method: 'get',
    url: '/api/entitlement-assign/tenant/{tenantId}/mspEntitlementBanner'
  },
  refreshMspLicensesData: {
    method: 'post',
    url: '/api/entitlement-assign/tenant/{tenantId}/mspEntitlement/refresh'
  },
  getMspEntitlementSummary: {
    method: 'get',
    url: '/api/entitlement-assign/tenant/{tenantId}/mspEntitlementSummary'
  },
  getMspEntitlement: {
    method: 'get',
    url: '/api/entitlement-assign/tenant/{tenantId}/mspEntitlement'
  },
  getMspAssignmentSummary: {
    method: 'get',
    url: '/api/entitlement-assign/tenant/{tenantId}/assignment/summary'
  },
  getMspAssignmentHistory: {
    method: 'get',
    url: '/api/entitlement-assign/tenant/{tenantId}/assignment'
  },
  refreshMspEntitlement: {
    method: 'post',
    url: '/api/entitlement-assign/tenant/{tenantId}/mspEntitlement/refresh'
  },
  revokeMspAssignment: {
    method: 'post',
    url: '/api/entitlement-assign/tenant/{tenantId}/assignment/{mspAssignmentId}/revoke'
  },
  addMspAssignment: {
    method: 'post',
    url: '/api/entitlement-assign/tenant/{tenantId}/assignment'
  },
  mspAssignmentBulkOperation: {
    method: 'post',
    url: '/api/entitlement-assign/tenant/{tenantId}/assignment/bulkOperation'
  },
  getLicensesBanners: {
    method: 'get',
    url: '/api/entitlement-assign/tenant/{tenantId}/mspEntitlementBanner'
  },
  sendFeedback: {
    method: 'post',
    url: '/api/tenant/{tenantId}/send-feedback'
  },
  getMfaTenantDetails: {
    method: 'get',
    url: '/mfa/tenant/{tenantId}'
  },
  getMfaAdminDetails: {
    method: 'get',
    url: '/mfa/admin/{userId}'
  },
  mfaRegisterAdmin: {
    method: 'post',
    url: '/mfa/registerAdmin/{userId}'
  },
  mfaRegisterPhone: {
    method: 'post',
    url: '/mfa/registerPhone/{userId}'
  },
  setupMFAAccount: {
    method: 'post',
    url: '/mfa/setupAdmin/admin/{userId}'
  },
  mfaResendOTP: {
    method: 'post',
    url: '/mfa/resendOTP/admin/{tenantId}'
  },
  updateMFAAccount: {
    method: 'put',
    url: '/mfa/setupTenant/tenant/{tenantId}/{enable}'
  },
  getMfaMasterCode: {
    method: 'get',
    url: '/mfa/mastercode'
  },
  disableMFAMethod: {
    method: 'put',
    url: '/mfa/auth-method/{mfaMethod}/disable'
  },
  getVenueVspot: {
    method: 'get',
    url: '/api/tenant/{tenantId}/wifi/venue/{venueId}/vspot'
  },
  bindVenueVspot: {
    method: 'put',
    url: '/api/tenant/{tenantId}/wifi/venue/{venueId}/vspot/{vspotId}'
  },
  unbindVenueVspot: {
    method: 'delete',
    url: '/api/tenant/{tenantId}/wifi/venue/{venueId}/vspot'
  },
  GetVenueRadioCustomization: {
    method: 'get',
    url: '/api/tenant/{tenantId}/wifi/venue/{venueId}/radio'
  },
  GetVenueSyslog: {
    method: 'get',
    url: '/api/tenant/{tenantId}/wifi/venue/{venueId}/syslog'
  },
  UpdateVenueSyslog: {
    method: 'put',
    url: '/api/tenant/{tenantId}/wifi/venue/{venueId}/syslog'
  },
  GetVenueRogueAP: {
    method: 'get',
    url: '/api/tenant/{tenantId}/wifi/venue/{venueId}/rogue/ap'
  },
  GetVenueDefaultRegulatoryChannels: {
    method: 'get',
    url: '/api/tenant/{tenantId}/wifi/venue/{venueId}/valid-channels'
  },
  getDelegations: {
    method: 'get',
    url: '/api/tenant/{tenantId}/delegation?type=VAR'
  },
  getAdministrators: {
    method: 'get',
    url: '/api/tenant/{tenantId}/admin'
  },
  inviteVAR: {
    method: 'post',
    url: '/api/tenant/{tenantId}/delegation'
  },
  updateAdmin: {
    method: 'put',
    url: '/api/tenant/{tenantId}/admin'
  },
  findVAR: {
    method: 'get',
    url: '/api/tenant/{tenantId}/find-var?username={userName}'
  },
  revokeInvitation: {
    method: 'delete',
    url: '/api/tenant/{tenantId}/delegation/{delegationId}'
  },
  acceptRejectInvitation: {
    method: 'put',
    url: '/api/tenant/{tenantId}/delegation/{delegationId}'
  },
  validateOTPRecovery: {
    method: 'get',
    url: '/mfa/validateOTPRecoveryCode/{otp}/user/{userId}'
  },
  getMspBaseURL: {
    method: 'get',
    url: '/api/mspservice/baseurl'
  },
  getMspLabel: {
    method: 'get',
    url: '/api/mspservice/tenant/{tenantId}/msplabel'
  },
  addMspLabel: {
    method: 'post',
    url: '/api/mspservice/tenant/{tenantId}/msplabel'
  },
  updateMspLabel: {
    method: 'put',
    url: '/api/mspservice/tenant/{tenantId}/msplabel'
  },
  updateMspPortal: {
    method: 'put',
    url: '/api/mspservice/tenant/{tenantId}/msplabel'
  },
  getMspEcAccountList: {
    method: 'get',
    url: '/api/mspservice/tenant/{tenantId}/mspecaccounts'
  },
  addMspEcAccount: {
    method: 'post',
    url: '/api/mspservice/tenant/{tenantId}/mspecaccounts'
  },
  getMspEcAccount: {
    method: 'get',
    url: '/api/mspservice/tenant/{mspEcTenantId}'
  },
  getParentLogoUrl: {
    method: 'get',
    url: '/api/mspservice/tenant/{mspEcTenantId}/logourl'
  },
  getParentMspLabel: {
    method: 'get',
    url: '/api/mspservice/tenant/{tenantId}/msplabel'
  },
  updateMspEcAccount: {
    method: 'put',
    url: '/api/mspservice/tenant/{mspEcTenantId}'
  },
  deleteMspEcAccount: {
    method: 'delete',
    url: '/api/mspservice/tenant/{mspEcTenantId}'
  },
  getMspEcActivationStatus: {
    method: 'get',
    url: '/api/mspservice/tenant/{mspEcTenantId}/activationstatus'
  },
  deactivateMspEcAccount: {
    method: 'post',
    url: '/api/mspservice/tenant/{mspEcTenantId}/deactivation'
  },
  reactivateMspEcAccount: {
    method: 'post',
    url: '/api/mspservice/tenant/{mspEcTenantId}/reactivation'
  },
  setEcActivation: {
    method: 'post',
    url: '/api/mspservice/tenant/{mspEcTenantId}/deviceactivation'
  },
  getMspEcDeligatedAdmins: {
    method: 'get',
    url: '/api/mspservice/tenant/{mspEcTenantId}/delegatedmspadmins'
  },
  updateMspEcDeligatedAdmins: {
    method: 'put',
    url: '/api/mspservice/tenant/{mspEcTenantId}/delegatedmspadmins'
  },
  getMspEcAlarmList: {
    method: 'post',
    url: '/api/eventalarmapi/msp/{tenantId}/alarm/alarmlist'
  },
  getMspEcAdminList: {
    method: 'get',
    url: '/api/mspservice/tenant/{mspEcTenantId}/admins'
  },
  resendEcInvitation: {
    method: 'post',
    url: '/api/mspservice/tenant/{mspEcTenantId}/emailinvitation'
  },
  getMspEcBranddata: {
    method: 'get',
    url: '/api/mspservice/tenant/{mspEcTenantId}/brandingdata'
  },
  getMspCustomersList: {
    method: 'post',
    url: '/api/viewmodel/tenant/{tenantId}/msp-ec'
  },
  getMspIntegratorsList: {
    method: 'post',
    url: '/api/viewmodel/tenant/{mspTenantId}/msp-ec'
  },
  getMspSupportList: {
    method: 'post',
    url: '/api/viewmodel/tenant/{tenantId}/msp-ec?delegation=support'
  },
  getMspAdminList: {
    method: 'post',
    url: '/api/viewmodel/tenant/{tenantId}/admin'
  },
  findMspVAR: {
    method: 'get',
    url: '/api/mspservice/tenant/{tenantId}/find-var?username={userName}'
  },
  getMspEcApAndClient: {
    method: 'get',
    url: '/api/viewmodel/{mspEcTenantId}/dashboard/overview/'
  },
  getMspEcSupportSliderValue: {
    method: 'get',
    url: '/api/mspservice/tenant/{mspEcTenantId}/delegation/support'
  },
  enableMspEcSupport: {
    method: 'post',
    url: '/api/mspservice/tenant/{mspEcTenantId}/delegation/support'
  },
  disableMspEcSupport: {
    method: 'delete',
    url: '/api/mspservice/tenant/{mspEcTenantId}/delegation/support'
  },
  getSasAccounts: {
    method: 'post',
    url: '/api/viewmodel/tenant/{tenantId}/lte/sas-account'
  },
  getSasAccount: {
    method: 'post',
    url: '/api/tenant/{tenantId}/lte/sas-account'
  },
  getSasProviders: {
    method: 'get',
    url: '/api/tenant/{tenantId}/lte/sas-operators'
  },
  addSasAccount: {
    method: 'post',
    url: '/api/tenant/{tenantId}/lte/sas-account'
  },
  updateSasAccount: {
    method: 'put',
    url: '/api/tenant/{tenantId}/lte/sas-account/{accountId}'
  },
  deleteSasAccount: {
    method: 'delete',
    url: '/api/tenant/{tenantId}/lte/sas-account'
  },
  getVMDelegations: {
    method: 'post',
    url: '/api/viewmodel/tenant/{tenantId}/delegations'
  },
  assignMspEcToIntegrator: {
    method: 'post',
    url: '/api/mspservice/tenant/assign/{mspIntegratorId}'
  },
  getAssignedMspEcToIntegrator: {
    method: 'get',
    url: '/api/mspservice/tenant/assign/{mspIntegratorId}?delegationType={mspIntegratorType}'
  },
  updateAssignedMspEcDeligatedAdmins: {
    method: 'put',
    url: '/api/mspservice/tenant/{mspEcTenantId}/delegation/assignedmspadmins'
  },
  getUpgradePreferences: {
    method: 'get',
    url: '/api/upgrade/tenant/{tenantId}/preference'
  },
  updateUpgradePreferences: {
    method: 'put',
    url: '/api/upgrade/tenant/{tenantId}/preference'
  },
  getVenueVersionList: {
    method: 'get',
    url: '/api/tenant/{tenantId}/wifi/upgrade/venue'
  },
  getLatestFirmwareList: {
    method: 'get',
    url: '/api/tenant/{tenantId}/wifi/upgrade/version/latest'
  },
  getAvailableFirmwareList: {
    method: 'get',
    url: '/api/tenant/{tenantId}/wifi/upgrade/version/release'
  },
  getFirmwareVersionIdList: {
    method: 'get',
    url: '/api/tenant/{tenantId}/wifi/upgrade/version'
  },
  skipSwitchUpgradeSchedules: {
    method: 'delete',
    url: '/api/switch/tenant/{tenantId}/switch/upgrade/skip'
  },
  updateSwitchVenueSchedules: {
    method: 'post',
    url: '/api/switch/tenant/{tenantId}/switch/upgrade/venue/schedule'
  },
  getSwitchLatestFirmwareList: {
    method: 'get',
    url: '/api/switch/tenant/{tenantId}/switch/upgrade/version/latest'
  },
  getSwitchFirmwareVersionIdList: {
    method: 'get',
    url: '/api/switch/tenant/{tenantId}/switch/upgrade/version'
  },
  getSwitchVenueVersionList: {
    method: 'post',
    url: '/api/switch/tenant/{tenantId}/switch/upgrade/venue'
  },
  getSwitchAvailableFirmwareList: {
    method: 'get',
    url: '/api/switch/tenant/{tenantId}/switch/upgrade/version/release'
  },
  getInvalidTimeSlots: {
    method: 'get',
    url: '/api/upgrade/tenant/{tenantId}/invalid-time'
  },
  skipVenueUpgradeSchedules: {
    method: 'delete',
    url: '/api/tenant/{tenantId}/wifi/skip/venue/schedule'
  },
  updateVenueSchedules: {
    method: 'post',
    url: '/api/tenant/{tenantId}/wifi/upgrade/venue/schedule'
  },
  getMspDeviceInventory: {
    method: 'post',
    url: '/api/viewmodel/tenant/{tenantId}/ec-inventory'
  },
  getIntegratorDeviceInventory: {
    method: 'post',
    url: '/api/viewmodel/tenant/{mspTenantId}/ec-inventory'
  },
  getCloudCertStatus: {
    method: 'get',
    url: '/api/tenant/{tenantId}/cloud-cert'
  },
  getSupportToken: {
    method: 'post',
    url: '/api/tenant/{tenantId}/chatbot/idtoken'
  },
  getMspEcIncidentList: {
    method: 'post',
    url: '/api/viewmodel/{tenantId}/dashboard/incidents/list'
  },
  validateMspAdmins: {
    method: 'post',
    url: '/api/tenant/{tenantId}/admin/mspecadmindeletevalidation'
  },
  exportMspEcDeviceInventory: {
    method: 'post',
    url: '/api/viewmodel/tenant/{tenantId}/ec-inventory/export'
  },
  getCloudMessageBanner: {
    method: 'get',
    url: '/api/upgrade/tenant/{tenantId}/banner'
  }
}

export const DpUrlsInfo: { [action:string]: ApiInfo } = {
  CreateDp: {
    method: 'post',
    url: '/api/tenant/{tenantId}/tes/dp-api'
  },
  GetDp: {
    method: 'get',
    url: '/api/tenant/{tenantId}/tes/dp/{serialNumber}'
  },
  UpdateDp: {
    method: 'put',
    url: '/api/tenant/{tenantId}/tes/dp-api/{serialNumber}'
  },
  DeleteDp: {
    method: 'delete',
    url: '/api/tenant/{tenantId}/tes/dp-api'
  },
  getDpList: {
    method: 'post',
    url: '/api/viewmodel/{tenantId}/tes/dp'
  },
  CreateDpGroup: {
    method: 'post',
    url: '/api/tenant/{tenantId}/tes/dp-api/dp-group'
  },
  UpdateDpGroup: {
    method: 'put',
    url: '/api/tenant/{tenantId}/tes/dp-api/dp-group/{dpGroupId}'
  },
  DeleteDpGroup: {
    method: 'delete',
    url: '/api/tenant/{tenantId}/tes/dp-api/dp-group/{dpGroupId}'
  },
  GetDpGroup: {
    method: 'get',
    url: '/api/tenant/{tenantId}/tes/dp/dp-group/{dpGroupId}'
  },
  GetDpGroupList: {
    method: 'post',
    url: '/api/viewmodel/{tenantId}/tes/dp/dp-group'
  },
  UpdateVenueBinding: {
    method: 'put',
    url: '/api/tenant/{tenantId}/tes/dp-api/venue/{venueId}'
  },
  RemoveVenueBinding: {
    method: 'delete',
    url: '/api/tenant/{tenantId}/tes/dp-api/venue/{venueId}'
  },
  GetLatestFirmwareVersion: {
    method: 'get',
    url: '/api/tenant/{tenantId}/tes/dp/firmware-metadata?latestVersion=true'
  },
  GetFirmwareVersions: {
    method: 'get',
    url: '/api/tenant/{tenantId}/tes/dp/firmware-metadata'
  },
  DownloadLog: {
    method: 'get',
    url: '/api/tenant/{tenantId}/tes/dp/{serialNumber}/download-log'
  },
  GetPacketCaptureStatus: {
    method: 'get',
    url: '/api/tenant/{tenantId}/tes/dp/{serialNumber}/packet-capture'
  },
  StartPacketCapture: {
    method: 'post',
    url: '/api/tenant/{tenantId}/tes/dp-api/{serialNumber}/packet-capture/start'
  },
  StopPacketCapture: {
    method: 'post',
    url: '/api/tenant/{tenantId}/tes/dp-api/{serialNumber}/packet-capture/stop'
  },
  GetDpGroupUpgradeAdvice: {
    method: 'post',
    url: '/api/tenant/{tenantId}/tes/dp/dp-group/upgradeAdvice'
  },
  UpgradeDpGroupFirmwareNow: {
    method: 'put',
    url: '/api/tenant/{tenantId}/tes/dp-api/dp-group/firmware?immediate=true'
  },
  GetDpUpgradePreferences: {
    method: 'get',
    url: '/api/upgrade/tenant/{tenantId}/dp/preference'
  },
  UpdateDpUpgradePreferences: {
    method: 'put',
    url: '/api/upgrade/tenant/{tenantId}/dp/preference'
  },
  UpdateDpUpgradeSchedule: {
    method: 'put',
    url: '/api/tenant/{tenantId}/tes/dp-api/dp-group/firmware/upgrade-schedule'
  },
  SkipDpGroupUpgradeSchedules: {
    method: 'delete',
    url: '/api/tenant/{tenantId}/tes/dp-api/dp-group/firmware/upgrade-schedule'
  },
  GetDpFirmwareUpgradeAvailable: {
    method: 'get',
    url: '/api/tenant/{tenantId}/tes/dp/dp-group/upgradeAvailable'
  },
  GetDpTunnels: {
    method: 'get',
    url: '/api/viewmodel/{tenantId}/tes/dp/{dpId}/tunnels'
  }
}
