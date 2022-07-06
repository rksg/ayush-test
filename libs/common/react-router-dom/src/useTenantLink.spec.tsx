import React from 'react'

import { renderHook }                  from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { useTenantLink } from './useTenantLink'

const getWrapper = (basePath: string = '') =>
  ({ children }: { children: React.ReactElement }) => (
    <MemoryRouter initialEntries={[`${basePath}/t/t-id?test=ok`]}>
      <Routes>
        <Route path={`${basePath}/t/:tenantId`} element={children} />
      </Routes>
    </MemoryRouter>
  )

describe('useTenantLink', () => {
  it('returns path prepend with /t/:tenantId', () => {
    const { result } = renderHook(
      () => useTenantLink('/networks'),
      { wrapper: getWrapper('') }
    )
    expect(result.current.pathname).toEqual('/t/t-id/networks')
  })
  it('keeps search parameters', () => {
    const { result } = renderHook(
      () => useTenantLink('/some/path'),
      { wrapper: getWrapper('') }
    )
    expect(result.current.pathname).toEqual('/t/t-id/some/path')
    expect(result.current.search).toEqual('?test=ok')
  })
  it('merges search parameters', () => {
    const { result } = renderHook(
      () => useTenantLink('/some/path?another=param'),
      { wrapper: getWrapper('') }
    )
    expect(result.current.pathname).toEqual('/t/t-id/some/path')
    expect(result.current.search).toEqual('?test=ok&another=param')
  })
  it('replaces search parameters', () => {
    const { result } = renderHook(
      () => useTenantLink('/some/path?another=param&test=updated'),
      { wrapper: getWrapper('') }
    )
    expect(result.current.pathname).toEqual('/t/t-id/some/path')
    expect(result.current.search).toEqual('?test=updated&another=param')
  })

  describe('basePath = /base/path/', () => {
    const basePath = '/base/path'
    let old: string
    beforeAll(() => {
      old = document.baseURI
      Object.defineProperty(document, 'baseURI', {
        configurable: true,
        value: `http://localhost${basePath}/`
      })
    })
    afterAll(() => {
      Object.defineProperty(document, 'baseURI', {
        configurable: true,
        value: old
      })
    })
    it('returns path prepend with /t/:tenantId', () => {
      const { result } = renderHook(
        () => useTenantLink('/networks'),
        { wrapper: getWrapper(basePath) }
      )
      expect(result.current.pathname).toEqual(`${basePath}/t/t-id/networks`)
    })
  })
})
