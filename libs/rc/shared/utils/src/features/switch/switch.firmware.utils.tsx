import _ from 'lodash'

export const checkVersionAtLeast10010b = (version: string): boolean => {
  if (_.isString(version) && version.includes('10010b')) {
    return true
  } else {
    return compareSwitchVersion(version, '10010b') > 0
  }
}

export const checkVersionAtLeast10010c = (version: string): boolean => {
  if (_.isString(version) && version.includes('10010c')) {
    return true
  } else {
    return compareSwitchVersion(version, '10010c') > 0
  }
}

export const checkVersionAtLeast09010h = (version: string): boolean => {
  if (_.isString(version) && version.includes('09010h')) {
    return true
  } else {
    return compareSwitchVersion(version, '09010h') > 0
  }
}

export const getStackUnitsMinLimitation = (
  switchModel: string, firmwareVersion: string, firmwareVersionAboveTen: string): number => {
  if (switchModel?.includes('ICX8200')) {
    return checkVersionAtLeast10010b(firmwareVersionAboveTen) ? 12 : 4
  } else if (switchModel?.includes('ICX7150')) {
    return (checkVersionAtLeast09010h(firmwareVersion) ? 4 : 2)
  } else { // 7550, 7650, 7850
    if (checkVersionAtLeast10010c(firmwareVersion)) {
      // For the switch's own firmware, this field contains the value '10010'.
      return 12
    }
    return (checkVersionAtLeast09010h(firmwareVersion) ? 8 : 4)
  }
}

export const compareSwitchVersion = (compareVersion: string, targetVersion: string): number => {
  const cleanedCompareVersion = compareVersion.replace('.bin', '')
  // eslint-disable-next-line max-len
  const switchVersionReg = /^(?:[A-Z]{3,})?(?<major>\d{4,})(?<minor>[a-z]*)(?:_cd(?<candidate>\d+))?(?:_rc(?<rcbuild>\d+))?(?:_b(?<build>\d+))?$/
  const group1 = cleanedCompareVersion?.match(switchVersionReg)?.groups
  const group2 = targetVersion?.match(switchVersionReg)?.groups
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


export const convertSwitchVersionFormat = (version: string) => {
  // eslint-disable-next-line max-len
  const switchVersionReg = /^(?:[A-Z]{3,})?(?<major>\d{4,})(?<minor>[a-z]*)(?:(?<build>(_[a-z]*\d+)*))?$/
  const versionGroup = version?.match(switchVersionReg)?.groups
  const newVersionGroup: string[] = []

  if (versionGroup) {
    const majorVersionReg = /(\d{2,})(\d+)(\d{2,})$/
    const majorGroup = versionGroup['major']?.match(majorVersionReg)

    if (majorGroup && majorGroup.shift()) { // remove matched full string
      if (majorGroup[0].startsWith('0')) {
        majorGroup[0] = majorGroup[0].replace(/^0+/, '')
      }
      newVersionGroup.push(majorGroup.join('.'))
    }
    newVersionGroup.push(versionGroup['minor'])
    newVersionGroup.push(versionGroup['build'])

    return newVersionGroup.join('')
  }
  return version
}

