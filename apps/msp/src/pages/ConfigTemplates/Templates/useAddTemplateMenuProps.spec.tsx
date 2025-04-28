import { ItemType }               from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { ConfigTemplateType }     from '@acx-ui/rc/utils'
import { renderHook }             from '@acx-ui/test-utils'

import { useAddTemplateMenuProps, createPolicyMenuItem, createServiceMenuItem, useSwitchMenuItems, useWiFiMenuItems, usePolicyMenuItems, useServiceMenuItems, useVenueItem } from './useAddTemplateMenuProps'

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
  [ConfigTemplateType.AP_GROUP]: false,
  [ConfigTemplateType.ETHERNET_PORT_PROFILE]: false
}

describe('useAddTemplateMenuProps', () => {
  beforeEach(() => {
    mockedUseConfigTemplateVisibilityMap.mockReturnValue({ ...mockedConfigTemplateVisibilityMap })
  })
  describe('main overlay', () => {
    it('should return the correct menu items for the main overlay', () => {
      const { result } = renderHook(() => useAddTemplateMenuProps())
      expect(result.current?.items?.filter(item => item)).toHaveLength(4)
    })

    it('should return null if no items are available', () => {
      const mockedMap = Object.fromEntries(
        Object.keys(mockedConfigTemplateVisibilityMap).map(key => [key, false])
      )

      mockedUseConfigTemplateVisibilityMap.mockReturnValue(mockedMap)
      const { result } = renderHook(() => useAddTemplateMenuProps())
      expect(result.current).toBeNull()
    })

    // eslint-disable-next-line max-len
    it('should return the correct menu items for the main overlay when the new service catatlog FF is enabled', () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.NEW_SERVICE_CATALOG)

      const { result } = renderHook(() => useAddTemplateMenuProps())
      expect(result.current?.items?.filter(item => item)).toHaveLength(3)

      const newServiceMenuItem = result.current?.items?.[2] as { children: ItemType[] }
      expect(newServiceMenuItem).toBeDefined()
      expect(newServiceMenuItem).toHaveProperty('children')
      expect(Array.isArray(newServiceMenuItem?.children)).toBe(true)
      expect(newServiceMenuItem?.children).toHaveLength(5)

    })
  })

  describe('usePolicyMenuItems', () => {
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

    it('should return null if no policy items are available', () => {
      const mockedMap = {
        [ConfigTemplateType.RADIUS]: false,
        [ConfigTemplateType.ACCESS_CONTROL]: false,
        [ConfigTemplateType.VLAN_POOL]: false,
        [ConfigTemplateType.SYSLOG]: false,
        [ConfigTemplateType.ROGUE_AP_DETECTION]: false
      }
      mockedUseConfigTemplateVisibilityMap.mockReturnValue(mockedMap)
      const { result } = renderHook(() => usePolicyMenuItems())
      expect(result.current).toBeNull()
    })
  })

  describe('useServiceMenuItems', () => {
    it('should create the correct service menu item', () => {
      // eslint-disable-next-line max-len
      const allowedResult = createServiceMenuItem(ConfigTemplateType.DPSK, mockedConfigTemplateVisibilityMap)
      expect(allowedResult).toBeDefined()
      expect(allowedResult?.key).toBe(`add-${ConfigTemplateType.DPSK}`)

      // eslint-disable-next-line max-len
      const disallowedResult = createServiceMenuItem(ConfigTemplateType.ACCESS_CONTROL, mockedConfigTemplateVisibilityMap)
      expect(disallowedResult).toBeNull()
    })

    it('should return null if no service items are available', () => {
      const mockedMap = {
        [ConfigTemplateType.DPSK]: false,
        [ConfigTemplateType.DHCP]: false,
        [ConfigTemplateType.PORTAL]: false,
        [ConfigTemplateType.WIFI_CALLING]: false
      }
      mockedUseConfigTemplateVisibilityMap.mockReturnValue(mockedMap)
      const { result } = renderHook(() => useServiceMenuItems())
      expect(result.current).toBeNull()
    })
  })

  describe('useSwitchMenuItems', () => {
    it('should return null when no switch template is visible', () => {
      const { result } = renderHook(() => useSwitchMenuItems())
      expect(result.current).toBeNull()
    })

    it('should create a switch menu item when SWITCH_REGULAR is visible', () => {
      mockedUseConfigTemplateVisibilityMap.mockReturnValue({
        ...mockedConfigTemplateVisibilityMap,
        [ConfigTemplateType.SWITCH_REGULAR]: true
      })
      const { result } = renderHook(() => useSwitchMenuItems())
      const children = (result.current as { children: Array<{ key: string }> })?.children
      expect(children[0]?.key).toBe('add-switch-regular-profile')
    })

    it('should create a switch menu item when SWITCH_CLI is visible', () => {
      mockedUseConfigTemplateVisibilityMap.mockReturnValue({
        ...mockedConfigTemplateVisibilityMap,
        [ConfigTemplateType.SWITCH_CLI]: true
      })
      const { result } = renderHook(() => useSwitchMenuItems())
      const children = (result.current as { children: Array<{ key: string }> })?.children
      expect(children.filter(c => c)[0]?.key).toBe('add-switch-cli-profile')
    })

    it('should create both menu items when SWITCH_REGULAR and SWITCH_CLI are visible', () => {
      mockedUseConfigTemplateVisibilityMap.mockReturnValue({
        ...mockedConfigTemplateVisibilityMap,
        [ConfigTemplateType.SWITCH_REGULAR]: true,
        [ConfigTemplateType.SWITCH_CLI]: true
      })
      const { result } = renderHook(() => useSwitchMenuItems())
      const children = (result.current as { children: ItemType[] })?.children
      expect(children.length).toBe(2)
    })
  })

  describe('useWiFiMenuItems', () => {
    it('should return null when neither NETWORK nor AP_GROUP is visible', () => {
      mockedUseConfigTemplateVisibilityMap.mockReturnValue({
        ...mockedConfigTemplateVisibilityMap,
        [ConfigTemplateType.NETWORK]: false,
        [ConfigTemplateType.AP_GROUP]: false
      })

      const { result } = renderHook(() => useWiFiMenuItems())
      expect(result.current).toBeNull()
    })

    it('should create a WiFi menu item when NETWORK is visible', () => {
      mockedUseConfigTemplateVisibilityMap.mockReturnValue({
        ...mockedConfigTemplateVisibilityMap,
        [ConfigTemplateType.NETWORK]: true,
        [ConfigTemplateType.AP_GROUP]: false
      })

      const { result } = renderHook(() => useWiFiMenuItems())
      const children = (result.current as { children: Array<{ key: string }> })?.children
      expect(children[0]?.key).toBe('add-wifi-network')
    })

    it('should create an AP Group menu item when AP_GROUP is visible', () => {
      mockedUseConfigTemplateVisibilityMap.mockReturnValue({
        ...mockedConfigTemplateVisibilityMap,
        [ConfigTemplateType.NETWORK]: false,
        [ConfigTemplateType.AP_GROUP]: true
      })

      const { result } = renderHook(() => useWiFiMenuItems())
      const children = (result.current as { children: Array<{ key: string }> })?.children
      expect(children.filter(c => c)[0]?.key).toBe('add-ap-group')
    })


    it('should create both menu items when NETWORK and AP_GROUP are visible', () => {
      mockedUseConfigTemplateVisibilityMap.mockReturnValue({
        ...mockedConfigTemplateVisibilityMap,
        [ConfigTemplateType.NETWORK]: true,
        [ConfigTemplateType.AP_GROUP]: true
      })

      const { result } = renderHook(() => useWiFiMenuItems())
      const children = (result.current as { children: ItemType[] })?.children
      expect(children.length).toBe(2)
    })
  })

  describe('useVenueItem', () => {
    it('should return null when Venue is not visible', () => {
      mockedUseConfigTemplateVisibilityMap.mockReturnValue({
        ...mockedConfigTemplateVisibilityMap,
        [ConfigTemplateType.VENUE]: false
      })

      const { result } = renderHook(() => useVenueItem())
      expect(result.current).toBeNull()
    })

    it('should create a Venue menu item when Venue is visible', () => {
      mockedUseConfigTemplateVisibilityMap.mockReturnValue({
        ...mockedConfigTemplateVisibilityMap,
        [ConfigTemplateType.VENUE]: true
      })

      const { result } = renderHook(() => useVenueItem())
      const key = (result.current as { key: string })?.key
      expect(key).toBe('add-venue')
    })
  })
})
