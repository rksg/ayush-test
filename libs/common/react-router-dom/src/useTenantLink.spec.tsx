import React from 'react'

import { renderHook }                  from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { useTenantLink } from './useTenantLink'

const getWrapper = (basePath: string = '') =>
  ({ children }: { children: React.ReactElement }) => (
    <MemoryRouter initialEntries={[`${basePath}/t/t-id`]}>
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
