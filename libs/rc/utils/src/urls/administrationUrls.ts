import { ApiInfo } from '../apiService'

export const AdministrationUrlsInfo: { [key: string]: ApiInfo } = {
  getTenantDetails: {
    method: 'get',
    url: '/api/tenant/:tenantId'
  },
  getRegisteredUsersList: {
    method: 'get',
    url: '/api/tenant/:tenantId/admins/registered'
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
    url: '/api/tenant/:tenantId/wifi/recovery'
  },
  updateRecoveryPassphrase: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/recovery'
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
    url: '/api/tenant/:tenantId/delegation?type=MSP'
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
    url: '/api/tenant/:tenantId/preferences'
  },
  updatePreferences: {
    method: 'put',
    url: '/api/tenant/:tenantId/preferences'
  },
  revokeInvitation: {
    method: 'delete',
    url: '/api/tenant/:tenantId/delegation/:delegationId'
  },
  inviteVAR: {
    method: 'post',
    url: '/api/tenant/:tenantId/delegation'
  },
  findVAR: {
    method: 'get',
    url: '/api/tenant/:tenantId/find-var'
  },
  getNotificationRecipients: {
    method: 'get',
    url: '/api/tenant/:tenantId/notification-recipient'
  },
  addRecipient: {
    method: 'post',
    url: '/api/tenant/:tenantId/notification-recipient'
  },
  updateRecipient: {
    method: 'put',
    url: '/api/tenant/:tenantId/notification-recipient/:recipientId'
  },
  deleteNotificationRecipients: {
    method: 'delete',
    url: '/api/tenant/:tenantId/notification-recipient'
  },
  deleteNotificationRecipient: {
    method: 'delete',
    url: '/api/tenant/:tenantId/notification-recipient/:recipientId'
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
    method: 'post',
    url: '/api/tenant/:tenantId/entitlement/internal-refresh'
  }
  // acceptRejectInvitation: {
  //   method: 'put',
  //   url: '/api/tenant/:tenantId/delegation/:delegationId'
  // }
}
