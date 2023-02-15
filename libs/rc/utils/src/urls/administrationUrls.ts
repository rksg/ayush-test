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
    url: '/api/tenant/:tenantId/admin'
  },
  updateAdmin: {
    method: 'put',
    url: '/api/tenant/:tenantId/admin'
  },
  deleteAdmin: {
    method: 'delete',
    url: '/api/tenant/:tenantId/admin/:adminId'
  },
  deleteAdmins: {
    method: 'delete',
    url: '/api/tenant/:tenantId/admin'
  },
  addAdmin: {
    method: 'post',
    url: '/api/tenant/:tenantId/admin'
  },
  // getMfaAdminDetails: {
  //   method: 'get',
  //   url: '/mfa/admin/:userId'
  // },
  // mfaRegisterAdmin: {
  //   method: 'post',
  //   url: '/mfa/registerAdmin/:userId'
  // },
  // mfaRegisterPhone: {
  //   method: 'post',
  //   url: '/mfa/registerPhone/:userId'
  // },
  // setupMFAAccount: {
  //   method: 'post',
  //   url: '/mfa/setupAdmin/admin/:userId'
  // },
  // mfaResendOTP: {
  //   method: 'post',
  //   url: '/mfa/resendOTP/admin/:tenantId'
  // },
  updateMFAAccount: {
    method: 'put',
    url: '/mfa/setupTenant/tenant/:tenantId/:enable'
  },
  getMfaTenantDetails: {
    method: 'get',
    url: '/mfa/tenant/:tenantId'
  },
  getAccountDetails: {
    method: 'get',
    url: '/api/tenant/:tenantId/account'
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
    url: '/api/tenant/:tenantId/delegation?type=VAR'
  },
  getTenantDelegation: {
    method: 'get',
    url: '/api/tenant/:tenantId/delegation?type=SUPPORT'
  },
  getEcTenantDelegation: {
    method: 'get',
    url: '/api/tenant/:tenantId/delegation?type=SUPPORT_EC'
  },
  getMspEcDelegations: {
    method: 'get',
    url: '/api/tenant/:tenantId/delegation?type=MSP'
  },
  enableAccessSupport: {
    method: 'post',
    url: '/api/tenant/:tenantId/delegation/support'
  },
  disableAccessSupport: {
    method: 'delete',
    url: '/api/tenant/:tenantId/delegation/support'
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
  }
  // acceptRejectInvitation: {
  //   method: 'put',
  //   url: '/api/tenant/:tenantId/delegation/:delegationId'
  // }
}