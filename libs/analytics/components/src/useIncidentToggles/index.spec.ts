import { IncidentToggle } from '@acx-ui/analytics/utils'
import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { renderHook }     from '@acx-ui/test-utils'

import { useIncidentToggles } from './index'

describe('useIncidentToggles', () => {
  it('should return correct toggles', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    expect(renderHook(() => useIncidentToggles()).result.current).toEqual({
      [IncidentToggle.AirtimeIncidents]: true,
      [IncidentToggle.SwitchDDoSIncidents]: true,
      [IncidentToggle.SwitchLoopDetectionIncidents]: true,
      [IncidentToggle.SwitchPortCongestionIncidents]: true,
      [IncidentToggle.SwitchUplinkPortCongestionIncidents]: true
    })

    jest.mocked(useIsSplitOn).mockReturnValue(false)
    expect(renderHook(() => useIncidentToggles()).result.current).toEqual({
      [IncidentToggle.AirtimeIncidents]: false,
      [IncidentToggle.SwitchDDoSIncidents]: false,
      [IncidentToggle.SwitchLoopDetectionIncidents]: false,
      [IncidentToggle.SwitchPortCongestionIncidents]: false,
      [IncidentToggle.SwitchUplinkPortCongestionIncidents]: false
    })
  })
})
