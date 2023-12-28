import { AgeTimeUnit } from '@acx-ui/rc/utils'

import { ageTimeUnitConversion } from './util'

describe('TunnelProfile util', () => {
  it('Should convvert to week', () => {
    const result = ageTimeUnitConversion(10080)
    expect(result?.value).toBe(1)
    expect(result?.unit).toBe(AgeTimeUnit.WEEK)
  })

  it('Should convvert to days', () => {
    const result = ageTimeUnitConversion(1440)
    expect(result?.value).toBe(1)
    expect(result?.unit).toBe(AgeTimeUnit.DAYS)
  })

  it('Should convvert to minutes', () => {
    const result = ageTimeUnitConversion(10)
    expect(result?.value).toBe(10)
    expect(result?.unit).toBe(AgeTimeUnit.MINUTES)
  })
})