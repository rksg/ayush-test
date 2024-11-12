import { isNumber } from 'lodash'

export const gpsToFixed = (val?: string | number): string => {
  if (!val) {
    return ''
  }

  if (isNumber(val)) {
    return (val as number).toFixed(6)
  }

  return parseFloat(val.toString()).toFixed(6)
}