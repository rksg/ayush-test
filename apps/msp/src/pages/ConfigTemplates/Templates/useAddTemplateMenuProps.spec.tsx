import { ItemType }           from '@acx-ui/components'
import { ConfigTemplateType } from '@acx-ui/rc/utils'
import { renderHook }         from '@acx-ui/test-utils'

import { useAddTemplateMenuProps, createPolicyMenuItem, createServiceMenuItem, useSwitchMenuItems, useWiFiMenuItems } from './useAddTemplateMenuProps'

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
  [ConfigTemplateType.PORTAL]: true,
  [ConfigTemplateType.VLAN_POOL]: false,
  [ConfigTemplateType.LAYER_2_POLICY]: true,
  [ConfigTemplateType.LAYER_3_POLICY]: true,
  [ConfigTemplateType.APPLICATION_POLICY]: true,
  [ConfigTemplateType.DEVICE_POLICY]: true,
  [ConfigTemplateType.WIFI_CALLING]: false,
  [ConfigTemplateType.SYSLOG]: false,
  [ConfigTemplateType.CLIENT_ISOLATION]: false,
  [ConfigTemplateType.ROGUE_AP_DETECTION]: false,
  [ConfigTemplateType.SWITCH_REGULAR]: false,
  [ConfigTemplateType.SWITCH_CLI]: false,
  [ConfigTemplateType.AP_GROUP]: false
}

describe('useAddTemplateMenuProps', () => {
  beforeEach(() => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({ ...mockedConfigTemplateVisibilityMap })
  })
  it('should return the correct menu items for the main overlay', () => {
    const { result } = renderHook(() => useAddTemplateMenuProps())
    expect(result.current?.items?.filter(item => item)).toHaveLength(4)
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

  it('should create the correct switch menu item', () => {
    const disallowedResult = useSwitchMenuItems()
    expect(disallowedResult).toBeNull()

    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.SWITCH_REGULAR]: true
    })

    const allowedResult = useSwitchMenuItems()
    expect(allowedResult?.key).toBe('add-switch-profile')

    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.SWITCH_REGULAR]: true,
      [ConfigTemplateType.SWITCH_CLI]: true
    })

    const allowedAllResult = useSwitchMenuItems() as { children: ItemType[] }
    expect(allowedAllResult?.children.length).toBe(2)
  })

  it('should create the correct wifi menu item', () => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.NETWORK]: false,
      [ConfigTemplateType.AP_GROUP]: false
    })

    const disallowedResult = useWiFiMenuItems()
    expect(disallowedResult).toBeNull()

    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.NETWORK]: true
    })

    const allowedResult = useWiFiMenuItems()
    expect(allowedResult?.key).toBe('add-wifi-profile')

    mockedUseConfigTemplateVisibilityMap.mockReturnValue({
      ...mockedConfigTemplateVisibilityMap,
      [ConfigTemplateType.NETWORK]: true,
      [ConfigTemplateType.AP_GROUP]: true
    })

    const allowedAllResult = useWiFiMenuItems() as { children: ItemType[] }
    expect(allowedAllResult?.children.length).toBe(2)
  })
})
