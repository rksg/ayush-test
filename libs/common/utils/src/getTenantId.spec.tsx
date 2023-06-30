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
  const tenantId = '8b9e8338c81d404e986c1d651ca7fed0'
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
    expect(getTenantId()).toEqual(tenantId)
  })

  it('tenant type t', () => {
    const { result } = renderHook(
      () => useTenantId(),
      { wrapper: getWrapper(initPath) }
    )
    expect(result.current).toEqual(tenantId)
  })

  it('other path', () => {
    const { result } = renderHook(
      () => useTenantId(),
      { wrapper: getWrapper(initPath, '/another/path') }
    )

    expect(result.current).toEqual('8b9e8338c81d404e986c1d651ca7fed0')
  })
})

describe('tenant type v', () => {
  const initPath = '/8b9e8338c81d404e986c1d651ca7fed0/v'
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
    expect(getTenantId()).toEqual('8b9e8338c81d404e986c1d651ca7fed0')
  })

  it('tenant type v', () => {
    const { result } = renderHook(
      () => useTenantId(),
      { wrapper: getWrapper(initPath) }
    )
    expect(result.current).toEqual('8b9e8338c81d404e986c1d651ca7fed0')
  })

  it('other path', () => {
    const { result } = renderHook(
      () => useTenantId(),
      { wrapper: getWrapper(initPath, '/another/path') }
    )

    expect(result.current).toEqual('8b9e8338c81d404e986c1d651ca7fed0')
  })
})

describe('other path', () => {
  const tenantId = '8b9e8338c81d404e986c1d651ca7fed0'
  const data = [
    { path: '', tenantId: '' },
    { path: '/', tenantId: '' },
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