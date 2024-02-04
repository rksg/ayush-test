import { IncidentToggle } from '@acx-ui/analytics/utils'
import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { renderHook }     from '@acx-ui/test-utils'

import { useIncidentToggles } from './index'

describe('useIncidentToggles', () => {
  it('should return correct toggles', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    expect(renderHook(() => useIncidentToggles()).result.current).toEqual({
      [IncidentToggle.AirtimeIncidents]: true
    })

    jest.mocked(useIsSplitOn).mockReturnValue(false)
    expect(renderHook(() => useIncidentToggles()).result.current).toEqual({
      [IncidentToggle.AirtimeIncidents]: false
    })
  })
})
