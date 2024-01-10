import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { renderHook }   from '@acx-ui/test-utils'

import { IncidentToggle }     from '../../../utils/src/constants'
import { useIncidentToggles } from '.'

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
