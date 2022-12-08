import { getJwtTokenPayload } from './jwtToken'

describe('jwtToken', () => {
  const oldCookie = document.cookie
  afterEach(() => {
    document.cookie = oldCookie
    jest.restoreAllMocks()
  })

  it('return token from default values, when JWT not available', () => {
    const token = {
      acx_account_regions: ['EU', 'AS', 'NA'],
      acx_account_tier: 'Gold',
      acx_account_type: 'REC',
      acx_account_vertical: 'Default',
      tenantId: 'e3d0c24e808d42b1832d47db4c2a7914'
    }
    document.cookie = `JWT=xxx.${window.btoa(JSON.stringify(token))}.xxx;`
    expect(getJwtTokenPayload()).toEqual(token)
  })

  it('return token when available', () => {
    const token = {
      acx_account_regions: ['EU', 'AS', 'NA'],
      acx_account_tier: 'Gold',
      acx_account_type: 'REC',
      acx_account_vertical: 'Default'
    }
    document.cookie = `JWT=xxx.${window.btoa(JSON.stringify(token))}.xxx;`
    expect(getJwtTokenPayload()).toEqual(token)
  })

  it('handle cache', () => {
    const token = {
      acx_account_regions: ['EU', 'AS', 'NA'],
      acx_account_tier: 'Gold',
      acx_account_type: 'REC',
      acx_account_vertical: 'Default'
    }
    document.cookie = `JWT=xxx.${window.btoa(JSON.stringify(token))}.xxx;`
    expect(getJwtTokenPayload()).toEqual(token)
    const spy = jest.spyOn(JSON, 'parse')
    expect(getJwtTokenPayload()).toEqual(token)
    expect(spy).not.toBeCalled()
  })

  it('throw on malformed cookie', () => {
    document.cookie = 'JWT=sdfsdf.sdfdsfsd.sdfsdf;'
    expect(() => getJwtTokenPayload()).toThrow('Unable to parse JWT Token')
  })
})
