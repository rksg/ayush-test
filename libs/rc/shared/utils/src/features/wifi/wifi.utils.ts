import _ from 'lodash'

export const gpsToFixed = (val?: string | number): string => {
  if (!val) {
    return ''
  }

  if (_.isNumber(val)) {
    return (val as number).toFixed(6)
  }

  return parseFloat(val.toString()).toFixed(6)
}
