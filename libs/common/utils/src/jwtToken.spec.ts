import { getTenantId }        from './getTenantId'
import { getJwtTokenPayload } from './jwtToken'

describe('jwtToken', () => {
  const oldCookie = document.cookie
  afterEach(() => {
    document.cookie = oldCookie
    jest.restoreAllMocks()
  })

  it('return token from default values, when JWT not available', () => {
    sessionStorage.setItem('jwt', '')
    sessionStorage.getItem('jwt')
    const token = {
      acx_account_tier: 'Platinum',
      acx_account_vertical: 'Default',
      tenantType: 'REC',
      isBetaFlag: false,
      tenantId: undefined
    }
    expect(getJwtTokenPayload()).toEqual(token)
  })

  it('return token with tenant value from default values, when JWT not available', () => {
    // eslint-disable-next-line max-len
    const url = 'http://dummy.com/api/ui/t/e3d0c24e808d42b1832d47db4c2a7914/dashboard/reports/(reportsAux:wifi-reports/wifi-dashboard-reports)'
    Object.defineProperty(window, 'location', {
      value: {
        href: url,
        pathname: url
      }
    })
    sessionStorage.setItem('jwt', '' )
    const token = {
      acx_account_tier: 'Platinum',
      acx_account_vertical: 'Default',
      tenantType: 'REC',
      isBetaFlag: false,
      tenantId: getTenantId()
    }
    expect(getJwtTokenPayload()).toEqual(token)
    expect(getTenantId()).toEqual('e3d0c24e808d42b1832d47db4c2a7914')
  })

  it('return token when available', () => {
    const token = {
      acx_account_regions: ['EU', 'AS', 'NA'],
      acx_account_tier: 'Gold',
      tenantType: 'REC',
      acx_account_vertical: 'Default'
    }
    const jwtToken = `JWT=xxx.${window.btoa(JSON.stringify(token))}.xxx;`
    sessionStorage.setItem('jwt', jwtToken)
    expect(getJwtTokenPayload()).toEqual(token)
  })

  it('token with VAR or REC tenantType to return value REC', () => {
    const token = {
      acx_account_regions: ['EU', 'AS', 'NA'],
      acx_account_tier: 'Gold',
      tenantType: 'VAR',
      acx_account_vertical: 'Default'
    }
    const jwtToken = `JWT=xxx.${window.btoa(JSON.stringify(token))}.xxx;`
    sessionStorage.setItem('jwt', jwtToken)
    expect(getJwtTokenPayload().tenantType).toEqual('REC')
  })

  it('token with MSP/MSP_EC/MSP_NON_VAR/MSP_INTEGRATOR/MSP_INSTALLER tenantType to return value MSP', () => {
    const token = {
      acx_account_regions: ['EU', 'AS', 'NA'],
      acx_account_tier: 'Gold',
      tenantType: 'MSP_NON_VAR',
      acx_account_vertical: 'Default'
    }
    const jwtToken = `JWT=xxx.${window.btoa(JSON.stringify(token))}.xxx;`
    sessionStorage.setItem('jwt', jwtToken)
    expect(getJwtTokenPayload().tenantType).toEqual('MSP')
  })
  
  it('handle cache', () => {
    const token = {
      acx_account_regions: ['EU', 'AS', 'NA'],
      acx_account_tier: 'Gold',
      tenantType: 'REC',
      acx_account_vertical: 'Default'
    }
    const jwtToken = `JWT=xxx.${window.btoa(JSON.stringify(token))}.xxx;`
    sessionStorage.setItem('jwt', jwtToken)
    expect(getJwtTokenPayload()).toEqual(token)
    const spy = jest.spyOn(JSON, 'parse')
    expect(getJwtTokenPayload()).toEqual(token)
    expect(spy).not.toBeCalled()
  })

  it('throw on malformed jwt token', () => {
    const jwtToken = 'JWT=sdfsdf.sdfdsfsd.sdfsdf;'
    sessionStorage.setItem('jwt', jwtToken)
    expect(() => getJwtTokenPayload()).toThrow('Unable to parse JWT Token')
  })
})
