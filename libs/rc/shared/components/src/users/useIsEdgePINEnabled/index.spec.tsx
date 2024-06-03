import { useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'

import { useIsEdgePINEnabled } from './index'


describe('use Edge and PIN enable feature flag or not', () => {
  it('return true while both of them must enabled', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    const isEnabled = useIsEdgePINEnabled()

    expect(isEnabled).toBe(true)
  })

  it('Tier not allowed then return false', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(false)

    const isEnabled = useIsEdgePINEnabled()

    expect(isEnabled).toBe(false)
  })

  it('PIN not enabled then return false', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    const isEnabled = useIsEdgePINEnabled()

    expect(isEnabled).toBe(false)
  })
})
