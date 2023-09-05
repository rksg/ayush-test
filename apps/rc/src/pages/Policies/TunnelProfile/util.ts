import { AgeTimeUnit } from '@acx-ui/rc/utils'

export const ageTimeUnitConversion = (ageTimeMinutes?: number):
{ value: number, unit: AgeTimeUnit } | undefined => {
  if(!ageTimeMinutes) return undefined

  if (ageTimeMinutes % 10080 === 0) {
    return {
      value: ageTimeMinutes / 10080,
      unit: AgeTimeUnit.WEEK
    }
  } else if (ageTimeMinutes % 1440 === 0) {
    return {
      value: ageTimeMinutes / 1440,
      unit: AgeTimeUnit.DAYS
    }
  } else {
    return {
      value: ageTimeMinutes,
      unit: AgeTimeUnit.MINUTES
    }
  }
}
