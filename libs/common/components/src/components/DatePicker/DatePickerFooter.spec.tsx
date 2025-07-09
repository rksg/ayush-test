import '@testing-library/jest-dom'

import { range as timepickerRange } from 'lodash'
import moment                       from 'moment'

import { getDisabledMinutes } from './DatePickerFooter'

describe('disabledMinutes', () => {
  const startDate = moment('2025-07-01T03:40:00')
  const range = { startDate, endDate: startDate.clone().hour(6).minute(40) }

  it('disables minutes before start minute when hour matches', () => {
    expect(getDisabledMinutes(3, range.startDate)).toEqual(timepickerRange(0, 40)) // disables 0-39
  })

  it('does not disable any minutes when hour does not match', () => {
    expect(getDisabledMinutes(6, range.startDate)).toEqual([]) // disables nothing
    expect(getDisabledMinutes(4, range.startDate)).toEqual([]) // disables nothing
  })
})