import _ from 'lodash'

export const checkVersionAtLeast09010h = (version: string): boolean => {
  if (_.isString(version) && version.includes('09010h')) {
    return true
  } else {
    return compareSwitchVersion(version, '09010h') > 0
  }
}

export const compareSwitchVersion = (a: string, b: string): number => {
  // eslint-disable-next-line max-len
  const switchVersionReg = /^(?:[A-Z]{3,})?(?<major>\d{4,})(?<minor>[a-z]*)(?:_cd(?<candidate>\d+))?(?:_rc(?<rcbuild>\d+))?(?:_b(?<build>\d+))?$/
  const group1 = a?.match(switchVersionReg)?.groups
  const group2 = b?.match(switchVersionReg)?.groups
  if (group1 && group2) {
    let res = 0
    const keys = ['major', 'minor', 'candidate', 'rcbuild', 'build']
    keys.every(key=>{
      const initValue = (key === 'candidate') ? '0' : (key === 'build') ? '999' : ''
      const aValue = group1[key] || initValue
      const bValue = group2[key] || initValue
      res = aValue.localeCompare(bValue, 'en-u-kn-true') // sort by charCode and numeric

      if (key === 'rcbuild' && (
        (aValue && bValue === '' && !group2['build']) ||
        (aValue === '' && !group1['build'] && bValue)
      )) { // '10010' == '10010_rc2'
        res = 0
        return false
      }
      return res === 0 // false to break every loop
    })
    return res
  }
  return 0
}
