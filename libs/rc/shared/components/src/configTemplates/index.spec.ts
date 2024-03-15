import { useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { ConfigTemplateType }             from '@acx-ui/rc/utils'
import { renderHook }                     from '@acx-ui/test-utils'

import { useConfigTemplateVisibilityMap } from '.'

describe('useIsConfigTemplateOnByType', () => {
  it('should return the correct map when the Beta use is OFF', () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(false)
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    const { result } = renderHook(() => useConfigTemplateVisibilityMap())

    expect(result.current).toEqual({
      [ConfigTemplateType.NETWORK]: false,
      [ConfigTemplateType.VENUE]: false,
      [ConfigTemplateType.DPSK]: false,
      [ConfigTemplateType.RADIUS]: false,
      [ConfigTemplateType.DHCP]: false,
      [ConfigTemplateType.ACCESS_CONTROL]: false,
      [ConfigTemplateType.VLAN_POOL]: false
    })
  })

  // eslint-disable-next-line max-len
  it('should return the correct map when the Beta use is ON and acx-ui-config-template is ON', () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useConfigTemplateVisibilityMap())

    expect(result.current).toEqual({
      [ConfigTemplateType.NETWORK]: true,
      [ConfigTemplateType.VENUE]: true,
      [ConfigTemplateType.DPSK]: true,
      [ConfigTemplateType.RADIUS]: true,
      [ConfigTemplateType.DHCP]: true,
      [ConfigTemplateType.ACCESS_CONTROL]: true,
      [ConfigTemplateType.VLAN_POOL]: true
    })
  })

  // eslint-disable-next-line max-len
  it('should return the correct map when the Beta use is ON and acx-ui-config-template is OFF', () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    const { result } = renderHook(() => useConfigTemplateVisibilityMap())

    expect(result.current).toEqual({
      [ConfigTemplateType.NETWORK]: true,
      [ConfigTemplateType.VENUE]: true,
      [ConfigTemplateType.DPSK]: true,
      [ConfigTemplateType.RADIUS]: true,
      [ConfigTemplateType.DHCP]: true,
      [ConfigTemplateType.ACCESS_CONTROL]: true,
      [ConfigTemplateType.VLAN_POOL]: false
    })
  })
})
