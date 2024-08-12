import moment from 'moment-timezone'

import { get } from '@acx-ui/config'

import { isDataRetained } from '.'

jest.mock('@acx-ui/config', () => ({ get: jest.fn() }))

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
