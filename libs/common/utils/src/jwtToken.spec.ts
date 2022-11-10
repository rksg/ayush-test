import { getJwtTokenPayload } from './jwtToken'

describe('jwtToken', () => {
  beforeEach(() => {
    // const payload = {
    //   swuId: '0032h00000LUqkEAAT',
    //   tenantType: 'REC',
    //   sub: 'e3d0c24e808d42b1832d47db4c2a7914',
    //   lastName: 'LastName 1960',
    //   companyName: 'Dog Company 1960',
    //   pver: 'acx-hybrid',
    //   iss: 'auth-service',
    //   acx_account_activation_flag: true,
    //   userIdmTenantId: '0012h00000NrlmFAAR',
    //   mlisaUserRole: 'alto-report-only',
    //   acx_account_activation_date: '2022-11-07',
    //   acx_account_type: "REC",
    //   scope: 'login',
    //   isMobileAppUser: false,
    //   exp: 1667863445,
    //   iat: 1667859845,
    //   email:'dog1960@email.com',
    //   isVar: false,
    //   acx_account_vertical: 'Default',
    //   isAuthOnlyUser: false,
    //   isRuckusUser: false,
    //   userName: 'dog1960@email.com',
    //   varIdmTenantId: '0012h00000NrlmFAAR',
    //   firstName: 'FisrtName 1960',
    //   varAltoTenantId: 'e3d0c24e808d42b1832d47db4c2a7914',
    //   flexera_alm_account_id: '',
    //   tenantId: 'e3d0c24e808d42b1832d47db4c2a7914',
    //   roleName: ['PRIME_ADMIN'],
    //   isRuckusSupport: false,
    //   originalRequestedURL: 'https://devalto.ruckuswireless.com/',
    //   renew: 1667863085,
    //   region: '[NA]',
    //   acx_account_regions: ['EU', 'AS', 'NA'],
    //   acx_account_tier: 'Gold',
    //   acx_trial_in_progress: true
    // }
  })
  it('Should return JWT token', () => {
    const jwtPayload = getJwtTokenPayload()
    expect(jwtPayload).not.toBeNull()
  })
})
