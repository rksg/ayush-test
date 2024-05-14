import { getTenantId } from './getTenantId'

describe('useTenantId', () => {
  const tenantId = '8b9e8338c81d404e986c1d651ca7fed0'
  const initPath = `/${tenantId}/t`
  beforeEach(() => {
    jest.resetModules()
    jest.doMock('@acx-ui/config', () => ({
      get: jest.fn().mockReturnValue('')
    }))
    jest.doMock('react-router-dom', () => ({
      useLocation: jest.fn().mockReturnValue({ pathname: initPath }),
      useSearchParams: jest.fn().mockReturnValue([
        new URLSearchParams('?selectedTenants=WyIwMDE1MDAwMDAwR2xJN1NBQVYiXQ==')
      ])
    }))
  })
  it('returns URL tenantId by window.location', () => {
    expect(require('./getTenantId').useTenantId()).toEqual(tenantId)
  })
  it('returns from parameter', () => {
    expect(require('./getTenantId').useTenantId(initPath)).toEqual(tenantId)
  })
  it('returns tenantId for RAI', () => {
    jest.doMock('@acx-ui/config', () => ({
      get: jest.fn().mockReturnValue('true')
    }))
    expect(require('./getTenantId').useTenantId()).toEqual('0015000000GlI7SAAV')
  })
  it('returns empty tenantId for RAI init', () => {
    jest.doMock('@acx-ui/config', () => ({
      get: jest.fn().mockReturnValue('true')
    }))
    jest.doMock('react-router-dom', () => ({
      useLocation: jest.fn().mockReturnValue(() => ({ pathname: initPath })),
      useSearchParams: jest.fn().mockReturnValue([
        new URLSearchParams('?abc=1')
      ])
    }))
    expect(require('./getTenantId').useTenantId()).toEqual(null)
  })
})

describe('other path', () => {
  const tenantId = '8b9e8338c81d404e986c1d651ca7fed0'
  const data = [
    { path: '', tenantId: undefined },
    { path: '/', tenantId: undefined },
    { path: `/api/ui-beta/t/${tenantId}`, tenantId },
    { path: `/t/${tenantId}`, tenantId },
    { path: `/v/${tenantId}`, tenantId },
    { path: `/api/ui-beta/v/${tenantId}`, tenantId },
    { path: `/${tenantId}/t`, tenantId },
    { path: `/${tenantId}/t/`, tenantId },
    { path: `/${tenantId}/v`, tenantId },
    { path: `/${tenantId}/v/`, tenantId },
    { path: `/${tenantId}/t/other-path`, tenantId },
    { path: `/${tenantId}/v/other/path`, tenantId }
  ]

  it('should return correct tenant id', () => {
    data.forEach(({ path, tenantId }) => expect(getTenantId(path)).toEqual(tenantId))
  })
})