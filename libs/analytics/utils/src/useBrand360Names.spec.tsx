import { Provider }   from '@acx-ui/store'
import { renderHook } from '@acx-ui/test-utils'

import { useBrand360Names } from './useBrand360Names'

import type { Settings } from './user/types'

const settings = {
  'brand-name': 'testBrand',
  'lsp-name': 'testLsp',
  'property-name': 'testProperty'
} as unknown as Settings

describe('useBrand360Names', () => {
  it('should render names correctly', async () => {
    const { result } = renderHook(
      () => useBrand360Names(settings),
      { wrapper: Provider }
    )
    expect(result.current).toMatchObject({
      brand: 'testBrand',
      lsp: 'testLsp',
      property: 'testProperty'
    })
  })
  it('should render defaults correctly', async () => {
    const { result } = renderHook(
      () => useBrand360Names({} as unknown as Settings),
      { wrapper: Provider }
    )
    expect(result.current).toMatchObject({
      brand: 'Brand 360',
      lsp: 'LSP',
      property: 'Property'
    })
  })
  it('should render defaults with undefined correctly', async () => {
    const { result } = renderHook(
      () => useBrand360Names(undefined as unknown as Settings),
      { wrapper: Provider }
    )
    expect(result.current).toMatchObject({
      brand: 'Brand 360',
      lsp: 'LSP',
      property: 'Property'
    })
  })
})
