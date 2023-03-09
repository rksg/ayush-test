import { rest } from 'msw'

import { mockServer } from '@acx-ui/test-utils'

import { getTenantId }                          from './getTenantId'
import { getJwtTokenPayload, loadImageWithJWT } from './jwtToken'

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
  it('load image with JWT', async () => {
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
      json: () => Promise.resolve({ signedUrl: 'testImage' })
    }))
    // eslint-disable-next-line max-len
    const url = 'http://dummy.com/api/ui/t/e3d0c24e808d42b1832d47db4c2a7914/dashboard/reports/(reportsAux:wifi-reports/wifi-dashboard-reports)'
    Object.defineProperty(window, 'location', {
      value: {
        href: url,
        pathname: url
      }
    })
    const token = {
      acx_account_tier: 'Platinum',
      acx_account_vertical: 'Default',
      tenantType: 'REC',
      isBetaFlag: false,
      tenantId: '12345'
    }
    const jwtToken = `JWT=xxx.${window.btoa(JSON.stringify(token))}.xxx;`
    sessionStorage.setItem('jwt', jwtToken)
    const result = await loadImageWithJWT('testId')
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/file/tenant/e3d0c24e808d42b1832d47db4c2a7914/testId/url',
      expect.objectContaining({
        headers: {
          // eslint-disable-next-line max-len
          Authorization: 'Bearer JWT=xxx.eyJhY3hfYWNjb3VudF90aWVyIjoiUGxhdGludW0iLCJhY3hfYWNjb3VudF92ZXJ0aWNhbCI6IkRlZmF1bHQiLCJ0ZW5hbnRUeXBlIjoiUkVDIiwiaXNCZXRhRmxhZyI6ZmFsc2UsInRlbmFudElkIjoiMTIzNDUifQ==.xxx;',
          mode: 'no-cors',
          ...{ 'x-rks-tenantid': 'e3d0c24e808d42b1832d47db4c2a7914' }
        }
      }))
    expect(result).toEqual('testImage')
  })
  it('load image with JWT throw error', async () => {
    mockServer.use(
      rest.get('/api/file/tenant/e3d0c24e808d42b1832d47db4c2a7914/testId/url', (req, res, ctx) => {
        return res(ctx.json(''))
      })
    )
    sessionStorage.setItem('jwt', '')
    try{
      await loadImageWithJWT('testId')
    }catch(err){

    }

  })
})

describe('loadImageWithJWT', () => {
  const mockResponse = { signedUrl: 'https://example.com/image.png' }

  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
      json: () => Promise.resolve(mockResponse)
    }))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return image URL when result is truthy', async () => {

    const token = {
      acx_account_regions: ['EU', 'AS', 'NA'],
      acx_account_tier: 'Gold',
      tenantType: 'REC',
      acx_account_vertical: 'Default'
    }
    const jwtToken = `JWT=xxx.${window.btoa(JSON.stringify(token))}.xxx;`
    sessionStorage.setItem('jwt', jwtToken)
    const imageId = '123'

    const result = await loadImageWithJWT(imageId)

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/file/tenant/e3d0c24e808d42b1832d47db4c2a7914/123/url',
      expect.objectContaining({
        headers: {
          // eslint-disable-next-line max-len
          Authorization: 'Bearer JWT=xxx.eyJhY3hfYWNjb3VudF9yZWdpb25zIjpbIkVVIiwiQVMiLCJOQSJdLCJhY3hfYWNjb3VudF90aWVyIjoiR29sZCIsInRlbmFudFR5cGUiOiJSRUMiLCJhY3hfYWNjb3VudF92ZXJ0aWNhbCI6IkRlZmF1bHQifQ==.xxx;',
          mode: 'no-cors'
        }
      }))
    expect(result).toEqual('https://example.com/image.png')
  })

  it('should throw error when result is falsy', async () => {
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
      json: () => Promise.reject(new Error('Error! status: 404')),
      status: 404
    }))
    const imageId = '456'

    await expect(loadImageWithJWT(imageId)).rejects.toThrow('Error! status: 404')
  })
})
