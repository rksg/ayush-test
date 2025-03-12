import { DisplayStates } from '../states'

import { getIntentStatus } from './getIntentStatus'

describe('getIntentStatus', () => {
  it('handle unknown state', () => {
    expect(getIntentStatus('xyz' as DisplayStates)).toEqual('Unknown')
  })

  it.each([
    { state: DisplayStates.pausedApplyFailed, retries: undefined },
    { state: DisplayStates.pausedApplyFailed, retries: 1 },
    { state: DisplayStates.pausedApplyFailed, retries: 2 }
  ])(
    'should handle "$state" with "$retries" retries',
    ({ state, retries }) => {
      const expected = 'Paused, Apply Failed'
        + `${retries && retries > 1 ? ` (retry ${retries - 1} of 2)` : ''}`
      expect(getIntentStatus(state, retries)).toEqual(expected)
    }
  )
})
