import { ConfigTemplateType } from '@acx-ui/rc/utils'
import { renderHook }         from '@acx-ui/test-utils'

import { useAddTemplateMenuProps, createPolicyMenuItem, createServiceMenuItem } from './useAddTemplateMenuProps'

const mockedUseConfigTemplateVisibilityMap = jest.fn()
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useConfigTemplateVisibilityMap: () => mockedUseConfigTemplateVisibilityMap()
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

  it('should create the correct policy menu item', () => {
    // eslint-disable-next-line max-len
    const allowedResult = createPolicyMenuItem(ConfigTemplateType.ACCESS_CONTROL, mockedConfigTemplateVisibilityMap)
    expect(allowedResult).toBeDefined()
    expect(allowedResult?.key).toBe(`add-${ConfigTemplateType.ACCESS_CONTROL}`)

    // eslint-disable-next-line max-len
    const disallowedResult = createPolicyMenuItem(ConfigTemplateType.VLAN_POOL, mockedConfigTemplateVisibilityMap)
    expect(disallowedResult).toBeNull()

    // eslint-disable-next-line max-len
    const disallowedResult2 = createPolicyMenuItem(ConfigTemplateType.DPSK, mockedConfigTemplateVisibilityMap)
    expect(disallowedResult2).toBeNull()
  })

  it('should create the correct service menu item', () => {
    // eslint-disable-next-line max-len
    const allowedResult = createServiceMenuItem(ConfigTemplateType.DPSK, mockedConfigTemplateVisibilityMap)
    expect(allowedResult).toBeDefined()
    expect(allowedResult?.key).toBe(`add-${ConfigTemplateType.DPSK}`)

    // eslint-disable-next-line max-len
    const disallowedResult = createServiceMenuItem(ConfigTemplateType.ACCESS_CONTROL, mockedConfigTemplateVisibilityMap)
    expect(disallowedResult).toBeNull()
  })
})
