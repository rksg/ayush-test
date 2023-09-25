import React from 'react'

import { renderHook }                  from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import * as config from '@acx-ui/config'

import { useTenantLink } from './useTenantLink'

jest.mock('@acx-ui/config')
const get = jest.mocked(config.get)

const getWrapper = (basePath: string = '') =>
  ({ children }: { children: React.ReactElement }) => (
    <MemoryRouter initialEntries={[`${basePath}/t-id/t?test=ok`]}>
      <Routes>
        <Route path={`${basePath}/:tenantId/t`} element={children} />
      </Routes>
    </MemoryRouter>
  )

describe('useTenantLink', () => {
  afterEach(() => {
    get.mockReturnValue('')
  })
  it('returns path prepend with MLISA base path', () => {
    get.mockReturnValue('true')
    const { result } = renderHook(
      () => useTenantLink({ pathname: undefined }),
      { wrapper: getWrapper('') }
    )
    expect(result.current.pathname).toEqual('/ai')
  })

  it('returns path without "analytics" for MLISA', () => {
    get.mockReturnValue('true')
    const { result } = renderHook(
      () => useTenantLink('/analytics/networks'),
      { wrapper: getWrapper('') }
    )
    expect(result.current.pathname).toEqual('/ai/networks')
  })

  it('returns pathname without "analytics" for MLISA', () => {
    get.mockReturnValue('true')
    const { result } = renderHook(
      () => useTenantLink({ pathname: '/analytics/networks' }),
      { wrapper: getWrapper('') }
    )
    expect(result.current.pathname).toEqual('/ai/networks')
  })
  it('returns path prepend with :tenantId/t', () => {
    const { result } = renderHook(
      () => useTenantLink('/networks'),
      { wrapper: getWrapper('') }
    )
    expect(result.current.pathname).toEqual('/t-id/t/networks')
  })
  it('keeps search parameters', () => {
    const { result } = renderHook(
      () => useTenantLink('/some/path'),
      { wrapper: getWrapper('') }
    )
    expect(result.current.pathname).toEqual('/t-id/t/some/path')
    expect(result.current.search).toEqual('?test=ok')
  })
  it('merges search parameters', () => {
    const { result } = renderHook(
      () => useTenantLink('/some/path?another=param'),
      { wrapper: getWrapper('') }
    )
    expect(result.current.pathname).toEqual('/t-id/t/some/path')
    expect(result.current.search).toEqual('?test=ok&another=param')
  })
  it('replaces search parameters', () => {
    const { result } = renderHook(
      () => useTenantLink('/some/path?another=param&test=updated'),
      { wrapper: getWrapper('') }
    )
    expect(result.current.pathname).toEqual('/t-id/t/some/path')
    expect(result.current.search).toEqual('?test=updated&another=param')
  })
  it('accept tenantType = v', () => {
    const { result } = renderHook(
      () => useTenantLink('/dsahboard', 'v'),
      { wrapper: getWrapper('') }
    )
    expect(result.current.pathname).toEqual('/t-id/v/dsahboard')
  })
})
