import { rest } from 'msw'

import type { Settings }                   from '@acx-ui/analytics/utils'
import { Provider, rbacApiURL }            from '@acx-ui/store'
import { mockServer, renderHook, waitFor } from '@acx-ui/test-utils'

import { useBrand360Config } from './useBrand360Config'


const defaultSettings = {
  'brand-name': 'testBrand',
  'lsp-name': 'testLsp',
  'property-name': 'testProperty',
  'property-code-name':'testPropertyCode'
} as unknown as Settings

const mockTenantSettings = (settings: Settings) => {
  mockServer.use(
    rest.get(`${rbacApiURL}/tenantSettings`, (_req, res, ctx) => res(ctx.json(
      Object.entries(settings).map(([key, value]) => ({ key, value }))
    )))
  )
}

describe('useBrand360Config', () => {
  it('should render names correctly', async () => {
    mockTenantSettings(defaultSettings)
    const { result } = renderHook(
      () => useBrand360Config(),
      { wrapper: Provider }
    )
    await waitFor(() => {
      expect(result.current).toEqual(expect.objectContaining({
        names: {
          brand: 'testBrand',
          lsp: 'testLsp',
          property: 'testProperty',
          propertyCode: 'testPropertyCode'
        } }))
    })
  })
  it('should render defaults correctly', async () => {
    mockTenantSettings({} as unknown as Settings)
    const { result } = renderHook(
      () => useBrand360Config(),
      { wrapper: Provider }
    )
    await waitFor(() => {
      expect(result.current).toEqual(expect.objectContaining({
        names: {
          brand: 'Brand 360',
          lsp: 'LSP',
          property: 'Property',
          propertyCode: 'Property ID'
        } }))
    })
  })
  it('should render defaults with undefined correctly', async () => {
    mockTenantSettings(undefined as unknown as Settings)
    const { result } = renderHook(
      () => useBrand360Config(),
      { wrapper: Provider }
    )
    await waitFor(() => {
      expect(result.current).toEqual(expect.objectContaining({
        names: {
          brand: 'Brand 360',
          lsp: 'LSP',
          property: 'Property',
          propertyCode: 'Property ID'
        } }))
    })
  })
})
