import { DisplayStates } from '../states'

import { getIntentStatus } from './getIntentStatus'

describe('getIntentStatus', () => {
  it('handle unknown state', () => {
    expect(getIntentStatus('xyz' as DisplayStates)).toEqual('Unknown')
  })
})
