import { ApiInfo } from '../apiService'

export const AdministrationUrlsInfo: { [key: string]: ApiInfo } = {
  getTenantDetails: {
    method: 'get',
    url: '/tenants/self',
    oldUrl: '/api/tenant/:tenantId',
    newApi: true
  },
  getRegisteredUsersList: {
    method: 'get',
    url: '/admins/registered',
    oldUrl: '/api/tenant/:tenantId/admins/registered',
    newApi: true
  },
  getAdministrators: {
    method: 'get',
    url: '/admins',
    oldUrl: '/api/tenant/:tenantId/admin',
    newApi: true
  },
  updateAdmin: {
    method: 'put',
    url: '/admins',
    oldUrl: '/api/tenant/:tenantId/admin',
    newApi: true
  },
  deleteAdmin: {
    method: 'delete',
    url: '/admins/:adminId',
    oldUrl: '/api/tenant/:tenantId/admin/:adminId',
    newApi: true
  },
  deleteAdmins: {
    method: 'delete',
    url: '/admins',
    oldUrl: '/api/tenant/:tenantId/admin',
    newApi: true
  },
  addAdmin: {
    method: 'post',
    url: '/admins',
    oldUrl: '/api/tenant/:tenantId/admin',
    newApi: true
  },
  getAccountDetails: {
    method: 'get',
    url: '/tenants/accounts',
    oldUrl: '/api/tenant/:tenantId/account',
    newApi: true
  },
  getRecoveryPassphrase: {
    method: 'get',
    url: '/recoveryPskSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/recovery',
    newApi: true
  },
  updateRecoveryPassphrase: {
    method: 'put',
    url: '/recoveryPskSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/recovery',
    newApi: true
  },
  getDelegations: {
    method: 'get',
    url: '/tenants/delegations?type=VAR',
    oldUrl: '/api/tenant/:tenantId/delegation?type=VAR',
    newApi: true
  },
  getTenantDelegation: {
    method: 'get',
    url: '/tenants/delegations?type=SUPPORT',
    oldUrl: '/api/tenant/:tenantId/delegation?type=SUPPORT',
    newApi: true
  },
  getEcTenantDelegation: {
    method: 'get',
    url: '/tenants/delegations?type=SUPPORT_EC',
    oldUrl: '/api/tenant/:tenantId/delegation?type=SUPPORT_EC',
    newApi: true
  },
  getMspEcDelegations: {
    method: 'get',
    url: '/tenants/delegations?type=MSP',
    oldUrl: '/api/tenant/:tenantId/delegation?type=MSP',
    newApi: true
  },
  enableAccessSupport: {
    method: 'post',
    url: '/tenants/supportDelegations',
    oldUrl: '/api/tenant/:tenantId/delegation/support',
    newApi: true
  },
  disableAccessSupport: {
    method: 'delete',
    url: '/tenants/supportDelegations',
    oldUrl: '/api/tenant/:tenantId/delegation/support',
    newApi: true
  },
  getPreferences: {
    method: 'get',
    url: '/tenants/preferences',
    oldUrl: '/api/tenant/:tenantId/preferences',
    newApi: true
  },
  updatePreferences: {
    method: 'put',
    url: '/tenants/preferences',
    oldUrl: '/api/tenant/:tenantId/preferences',
    newApi: true
  },
  getAccountTier: {
    method: 'get',
    url: '/tenants/accountTier',
    newApi: true
  },
  revokeInvitation: {
    method: 'delete',
    url: '/tenants/delegations/:delegationId',
    oldUrl: '/api/tenant/:tenantId/delegation/:delegationId',
    newApi: true
  },
  inviteVAR: {
    method: 'post',
    url: '/tenants/delegations',
    oldUrl: '/api/tenant/:tenantId/delegation',
    newApi: true
  },
  findVAR: {
    method: 'get',
    url: '/tenants/find-var',
    oldUrl: '/api/tenant/:tenantId/find-var',
    newApi: true
  },
  getNotificationRecipients: {
    method: 'get',
    url: '/tenants/notificationRecipients',
    oldUrl: '/api/tenant/:tenantId/notification-recipient',
    newApi: true
  },
  addRecipient: {
    method: 'post',
    url: '/tenants/notificationRecipients',
    oldUrl: '/api/tenant/:tenantId/notification-recipient',
    newApi: true
  },
  updateRecipient: {
    method: 'put',
    url: '/tenants/notificationRecipients/:recipientId',
    oldUrl: '/api/tenant/:tenantId/notification-recipient/:recipientId',
    newApi: true
  },
  deleteNotificationRecipients: {
    method: 'delete',
    url: '/tenants/notificationRecipients',
    oldUrl: '/api/tenant/:tenantId/notification-recipient',
    newApi: true
  },
  deleteNotificationRecipient: {
    method: 'delete',
    url: '/tenants/notificationRecipients/:recipientId',
    oldUrl: '/api/tenant/:tenantId/notification-recipient/:recipientId',
    newApi: true
  },
  getEntitlementSummary: {
    method: 'get',
    url: '/entitlements/summaries',
    oldUrl: '/api/tenant/:tenantId/entitlement/summary',
    newApi: true
  },
  getEntitlementsList: {
    method: 'get',
    url: '/entitlements',
    oldUrl: '/api/tenant/:tenantId/entitlement',
    newApi: true
  },
  refreshLicensesData: {
    method: 'get',
    url: '/entitlements/summaries?refresh=true',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/entitlement/internal-refresh',
    newApi: true
  },
  internalRefreshLicensesData: {
    method: 'get',
    url: '/entitlements/summaries?refresh=true',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/entitlement/internal-refresh',
    newApi: false
  },
  convertNonVARToMSP: {
    method: 'post',
    url: '/api/mspservice/mspNonVAR/:tenantId',
    newApi: true
  }
  // acceptRejectInvitation: {
  //   method: 'put',
  //   url: '/api/tenant/:tenantId/delegation/:delegationId'
  // }
}
