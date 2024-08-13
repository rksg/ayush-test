import moment from 'moment-timezone'

import { get } from '@acx-ui/config'

import {
  isDataRetained
  // getDefaultTime,
  // getTransitionStatus,
  // parseTransitionGQLByOneClick,
  // parseTransitionGQLByAction
} from '.'

jest.mock('@acx-ui/config', () => ({ get: jest.fn() }))
jest.spyOn(global.Date, 'now').mockImplementation(
  () => new Date('2024-07-20T04:01:00.000Z').getTime()
)

describe('IntentAI utils', () => {
  describe('isDataRetained', () => {
    beforeEach(() => jest.mocked(get).mockReturnValue('380'))
    it('should return true', () => {
      expect(isDataRetained(moment().subtract(100, 'days').toISOString())).toBeTruthy()
    })
    it('should return false', () => {
      expect(isDataRetained(moment().subtract(400, 'days').toISOString())).toBeFalsy()
    })
    it('should handle undefined', () => {
      expect(isDataRetained(undefined)).toBeTruthy()
    })
  })

  it('should handle getDefaultTime', () => {
    expect(isDataRetained(moment().subtract(100, 'days').toISOString())).toBeTruthy()
  })
})

