import { ApiInfo } from '../apiService'

export const AdministrationUrlsInfo: { [key: string]: ApiInfo } = {
  getRegisteredUsersList: {
    method: 'get',
    url: '/api/tenant/:tenantId/admins/registered'
  },
  deleteAdmin: {
    method: 'delete',
    url: '/admins/:adminId',
    newApi: true
  },
  deleteAdmins: {
    method: 'delete',
    url: '/admins',
    newApi: true
  },
  addAdmin: {
    method: 'post',
    url: '/admins',
    newApi: true
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
  getAdministrators: {
    method: 'get',
    url: '/admins',
    newApi: true
  },
  updateAdmin: {
    method: 'put',
    url: '/admins',
    newApi: true
  },
  getAccountDetails: {
    method: 'get',
    url: '/tenants/accounts',
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
    newApi: true
  },
  getTenantDelegation: {
    method: 'get',
    url: '/tenants/delegations?type=SUPPORT',
    newApi: true
  },
  getEcTenantDelegation: {
    method: 'get',
    url: '/tenants/delegations?type=SUPPORT_EC',
    newApi: true
  },
  enableAccessSupport: {
    method: 'post',
    url: '/tenants/supportDelegations',
    newApi: true
  },
  disableAccessSupport: {
    method: 'delete',
    url: '/tenants/supportDelegations',
    newApi: true
  },
  getPreferences: {
    method: 'get',
    url: '/api/tenant/:tenantId/preferences'
  },
  updatePreferences: {
    method: 'put',
    url: '/api/tenant/:tenantId/preferences'
  }
}
