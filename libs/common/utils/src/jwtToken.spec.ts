import { getJwtTokenPayload, getJwtHeaders, loadImageWithJWT } from './jwtToken'

describe('getJwtTokenPayload', () => {
  afterEach(() => {
    sessionStorage.removeItem('jwt')
  })

  it('returns token with default values when JWT not available', () => {
    const originalUrl = window.location.href
    const url = 'http://dummy.com/api/ui/t/some-tenant-id/dashboard/reports'
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: url, pathname: url }
    })

    const token = {
      acx_account_tier: 'Platinum',
      acx_account_vertical: 'Default',
      tenantType: 'REC',
      isBetaFlag: false,
      tenantId: 'some-tenant-id'
    }
    expect(getJwtTokenPayload()).toEqual(token)

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: originalUrl, pathname: originalUrl }
    })
  })

  it('returns token values when JWT available and caches it', () => {
    const token = {
      acx_account_tier: 'Gold',
      acx_account_vertical: 'Default',
      tenantType: 'REC',
      isBetaFlag: false,
      tenantId: 'some-tenant-id'
    }
    const jwtToken = `xxx.${window.btoa(JSON.stringify(token))}.xxx`
    sessionStorage.setItem('jwt', jwtToken)

    expect(getJwtTokenPayload()).toEqual(token)
    const spy = jest.spyOn(JSON, 'parse')
    expect(getJwtTokenPayload()).toEqual(token)
    expect(spy).not.toBeCalled()
  })

  it('throws on malformed jwt token', () => {
    const jwtToken = 'xxx.sdfdsfsd.xxx'
    sessionStorage.setItem('jwt', jwtToken)

    expect(() => getJwtTokenPayload()).toThrow('Unable to parse JWT Token')
  })
})

describe('getJwtHeaders', () => {
  describe('when JWT is available', () => {
    const token = {
      acx_account_tier: 'Gold',
      acx_account_vertical: 'Default',
      tenantType: 'REC',
      isBetaFlag: false,
      tenantId: 'some-tenant-id'
    }
    const jwtToken = `xxx.${window.btoa(JSON.stringify(token))}.xxx`
    const originalUrl = window.location.href

    beforeEach(() => {
      sessionStorage.setItem('jwt', jwtToken)
    })

    afterEach(() => {
      sessionStorage.removeItem('jwt')
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: originalUrl, pathname: originalUrl }
      })
    })

    it('returns Authorization header', () => {
      const url = 'http://dummy.com/api/ui/t/some-tenant-id/dashboard'
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: url, pathname: url }
      })

      expect(getJwtHeaders()).toEqual({ Authorization: `Bearer ${jwtToken}` })
    })

    it('returns x-rks-tenantid header if delegation mode', () => {
      const url = 'http://dummy.com/api/ui/t/another-other-tenant/dashboard'
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: url, pathname: url }
      })

      expect(getJwtHeaders()).toEqual({
        'Authorization': `Bearer ${jwtToken}`,
        'x-rks-tenantid': 'another-other-tenant'
      })
    })
  })

  it('returns empty header if JWT is not available', () => {
    expect(getJwtHeaders()).toEqual({})
  })
})

describe('loadImageWithJWT', () => {
  const mockResponse = { signedUrl: 'https://example.com/image.png' }

  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
      json: () => Promise.resolve(mockResponse)
    }))
  })

  it('should return image URL when result is truthy', async () => {
    const originalUrl = window.location.href
    const url = 'http://dummy.com/api/ui/t/some-tenant-id/dashboard'
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: url, pathname: url }
    })

    const token = {
      acx_account_tier: 'Gold',
      acx_account_vertical: 'Default',
      tenantType: 'REC',
      isBetaFlag: false,
      tenantId: 'some-tenant-id'
    }
    const jwtToken = `xxx.${window.btoa(JSON.stringify(token))}.xxx`
    sessionStorage.setItem('jwt', jwtToken)

    const result = await loadImageWithJWT('123')
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/file/tenant/some-tenant-id/123/url',
      expect.objectContaining({
        headers: {
          // eslint-disable-next-line max-len
          Authorization: 'Bearer xxx.eyJhY3hfYWNjb3VudF90aWVyIjoiR29sZCIsImFjeF9hY2NvdW50X3ZlcnRpY2FsIjoiRGVmYXVsdCIsInRlbmFudFR5cGUiOiJSRUMiLCJpc0JldGFGbGFnIjpmYWxzZSwidGVuYW50SWQiOiJzb21lLXRlbmFudC1pZCJ9.xxx',
          mode: 'no-cors'
        }
      }))
    expect(result).toEqual('https://example.com/image.png')

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: originalUrl, pathname: originalUrl }
    })
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
