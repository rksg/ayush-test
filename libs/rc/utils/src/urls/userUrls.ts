import { ApiInfo } from '../apiService'

export const UserUrlsInfo: { [key: string]: ApiInfo } = {
  getMfaTenantDetails: {
    method: 'get',
    url: '/mfa/tenant/:tenantId'
  },
  getMfaAdminDetails: {
    method: 'get',
    url: '/mfa/admin/:userId'
  },
  mfaRegisterAdmin: {
    method: 'post',
    url: '/mfa/registerAdmin/:userId'
  },
  mfaRegisterPhone: {
    method: 'post',
    url: '/mfa/registerPhone/:userId'
  },
  setupMFAAccount: {
    method: 'post',
    url: '/mfa/setupAdmin/admin/:userId'
  },
  mfaResendOTP: {
    method: 'post',
    url: '/mfa/resendOTP/admin/:userId'
  },
  toggleMFA: {
    method: 'put',
    url: '/mfa/setupTenant/tenant/:tenantId/:enable'
  },
  getMfaMasterCode: {
    method: 'get',
    url: '/mfa/mastercode'
  },
  disableMFAMethod: {
    method: 'put',
    url: '/mfa/auth-method/:mfaMethod/disable'
  }
}

