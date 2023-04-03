import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { renderHook } from '@acx-ui/test-utils'

import { getTenantId, useTenantId } from './getTenantId'

const getWrapper = (initialEntries: string, appendedPath: string = '') =>
  ({ children }: { children: React.ReactElement }) => (
    <MemoryRouter initialEntries={[initialEntries]}>
      <Routes>
        <Route path={`/:tenantId/t${'/' + appendedPath}`} element={children} />
        <Route path={`/:tenantId/v${'/' + appendedPath}`} element={children} />
        <Route path='*' element={children} />
      </Routes>
    </MemoryRouter>
  )

describe('useTenantId', () => {
  const tenantId = 'tenant-id'
  const initPath = `/${tenantId}/t`

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...window.location,
        pathname: initPath
      }
    })})

  it('return URL tenantId by window.location', () => {
    expect(getTenantId()).toEqual('tenant-id')
  })

  it('tenant type t', () => {
    const { result } = renderHook(
      () => useTenantId(),
      { wrapper: getWrapper(initPath) }
    )
    expect(result.current).toEqual('tenant-id')
  })

  it('other path', () => {
    const { result } = renderHook(
      () => useTenantId(),
      { wrapper: getWrapper(initPath, '/another/path') }
    )

    expect(result.current).toEqual('tenant-id')
  })

  it('path does not prefix with /t or /v', () => {
    const { result } = renderHook(
      () => useTenantId(),
      { wrapper: getWrapper(`/${tenantId}/r`) }
    )

    expect(result.current).toEqual(undefined)
  })
})

describe('tenant type v', () => {
  const initPath = '/v-tenant/v'
  const { location } = window

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...location,
        pathname: initPath
      }
    })
  })

  it('return URL tenantId by window.location', () => {
    expect(getTenantId()).toEqual('v-tenant')
  })

  it('tenant type v', () => {
    const { result } = renderHook(
      () => useTenantId(),
      { wrapper: getWrapper(initPath) }
    )
    expect(result.current).toEqual('v-tenant')
  })

  it('other path', () => {
    const { result } = renderHook(
      () => useTenantId(),
      { wrapper: getWrapper(initPath, '/another/path') }
    )

    expect(result.current).toEqual('v-tenant')
  })
})

describe('other path', () => {
  const initPath = '/someType/others-tenant'
  const { location } = window

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...location,
        pathname: initPath
      }
    })
  })

  it('return URL tenantId by window.location', () => {
    expect(getTenantId()).toEqual(undefined)
  })

  it('other path', () => {
    const { result } = renderHook(
      () => useTenantId(),
      { wrapper: getWrapper(initPath, '/another/path') }
    )

    expect(result.current).toEqual(undefined)
  })
  it('should return undefined', () => {
    expect(getTenantId('/')).toEqual(undefined)
  })
  it('should identify 1st parameter as tenant id', () => {
    expect(getTenantId('/tid')).toEqual('tid')
  })
  it('should return tenant id when url starts with parameter followed by /', () => {
    expect(getTenantId('/tid/')).toEqual('tid')
  })
})