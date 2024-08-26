import moment from 'moment-timezone'

import { intentAIUrl, Provider }                         from '@acx-ui/store'
import { act, mockGraphqlMutation, renderHook, waitFor } from '@acx-ui/test-utils'

import { mockedIntentCRRM }     from './AIDrivenRRM/__tests__/fixtures'
import {
  roundUpTimeToNearest15Minutes,
  useIntentTransitionMutation
} from './useIntentTransitionMutation'

describe('intentai services', () => {
  const args = {
    ...mockedIntentCRRM,
    appliedOnce: true,
    settings: {
      date: moment('2024-07-14T00:00:00.000Z'),
      hour: 7.5
    }
  }

  it('should update preference and schedule correctly',
    async () => {
      const utils = require('./utils')
      jest.spyOn(utils, 'handleScheduledAt').mockImplementation(() => '2024-07-14T07:30:00.000Z')
      const resp = { transition: { success: true, errorMsg: '' , errorCode: '' } }
      mockGraphqlMutation(intentAIUrl, 'TransitionMutation', { data: resp })
      const { result } = renderHook(
        () => useIntentTransitionMutation(),
        { wrapper: Provider }
      )
      act(() => {
        result.current[0](args)
      })
      await waitFor(() => expect(result.current[1].isSuccess).toBe(true))
      expect(result.current[1].data)
        .toEqual(resp)
    })
})

describe('roundUpTimeToNearest15Minutes', () => {
  it('should return correct decimal hour', () => {
    const timeString = '08:30:00'
    expect(roundUpTimeToNearest15Minutes(timeString)).toEqual(8.5)
  })
})
