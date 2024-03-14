import { ConfigTemplateType } from '@acx-ui/rc/utils'
import { renderHook }         from '@acx-ui/test-utils'

import { useAddTemplateMenuProps, usePolicyMenuItem, useServiceMenuItem } from './useAddTemplateMenuProps'

const mockedUseConfigTemplateVisibilityMap = jest.fn()
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useConfigTemplateVisibilityMap: () => mockedUseConfigTemplateVisibilityMap(),
  ServiceConfigTemplateLink: () => 'ServiceConfigTemplateLink'
}))

const mockedConfigTemplateVisibilityMap: Record<ConfigTemplateType, boolean> = {
  [ConfigTemplateType.NETWORK]: true,
  [ConfigTemplateType.VENUE]: true,
  [ConfigTemplateType.DPSK]: true,
  [ConfigTemplateType.RADIUS]: true,
  [ConfigTemplateType.DHCP]: true,
  [ConfigTemplateType.ACCESS_CONTROL]: true,
  [ConfigTemplateType.VLAN_POOL]: false
}

describe('useAddTemplateMenuProps', () => {
  beforeEach(() => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({ ...mockedConfigTemplateVisibilityMap })
  })
  it('should return the correct menu items for the main overlay', () => {
    const { result } = renderHook(() => useAddTemplateMenuProps())
    expect(result.current.items).toHaveLength(4)
  })

  it('should return the correct policy menu item', () => {
    // const { result } = renderHook(() => usePolicyMenuItem(ConfigTemplateType.ACCESS_CONTROL))
    // expect(result.current).toEqual({
    //   key: `add-${ConfigTemplateType.ACCESS_CONTROL}`,
    //   label: 'PolicyConfigTemplateLink'
    // })

    const { result } = renderHook(() => usePolicyMenuItem(ConfigTemplateType.VLAN_POOL))
    expect(result.current).toBeNull()
  })

  it('should return the correct service menu item', () => {
    const { result } = renderHook(() => useServiceMenuItem(ConfigTemplateType.DPSK))
    expect(result.current).toEqual({
      key: `add-${ConfigTemplateType.DPSK}`,
      label: 'ServiceConfigTemplateLink'
    })
  })
})
