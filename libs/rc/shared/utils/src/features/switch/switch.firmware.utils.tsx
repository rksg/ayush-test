import _ from 'lodash'

import { FirmwareSwitchVenueVersionsV1002,
  SwitchFirmwareModelGroup } from '../../types'
const MAJOR = 'major'
const MINOR = 'minor'
const BUILD = 'build'
const RCBUILD = 'rcbuild'
const CANDIDATE = 'candidate'
const IS_DEV_FIRMWARE = 'isDevVersion'
const IS_RELEASE_FIRMWARE = 'isReleaseVersion'

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

export const invalidVersionFor82Av = (version: string): boolean => {
  if (_.isEmpty(version)) {
    return false
  }
  if (_.isString(version) && version.startsWith('10010')) {
    return !isVerGEVer(version, '10010f', false)
  } else if (_.isString(version) && version.startsWith('10020')) {
    return !isVerGEVer(version, '10020b', false)
  } else {
    return true
  }
}

export const invalidVersionFor81X = (version: string): boolean => {
  if (_.isEmpty(version)) {
    return false
  }
  if (_.isString(version) && version.startsWith('10010')) {
    return !isVerGEVer(version, '10010g', false)
  } else if (_.isString(version) && version.startsWith('10020')) {
    return !isVerGEVer(version, '10020c', false)
  } else {
    return true
  }
}

export const invalidVersionFor75Zippy = (version: string): boolean => {
  if (_.isEmpty(version)) {
    return false
  }
  return !(_.isString(version) && isVerGEVer(version, '10020b_cd1', true))
}

export const versionAbove10020a = (version: string): boolean => {
  return !!version && _.isString(version) && isVerGEVer(version, '10020a', false)
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

export const getStackUnitsMinLimitationV1002 = (
  switchModel: string,
  currentFirmware: string): number => {

  if (switchModel?.includes('ICX8200')) {
    return checkVersionAtLeast10010b(currentFirmware) ? 12 : 4
  } else if (switchModel?.includes('ICX7150')) {
    return (checkVersionAtLeast09010h(currentFirmware) ? 4 : 2)
  } else { // 7550, 7650, 7850
    if (checkVersionAtLeast10010c(currentFirmware)) {
      // For the switch's own firmware, this field contains the value '10010'.
      return 12
    }
    return (checkVersionAtLeast09010h(currentFirmware) ? 8 : 4)
  }
}

//The function will be deprecated in the future; please use the isVerGEVer function instead.
//Important: compareVersion or targetVersion may be empty
export const compareSwitchVersion = (compareVersion?: string, targetVersion?: string): number => {
  const cleanedCompareVersion = compareVersion?.replace('.bin', '')
  // eslint-disable-next-line max-len
  const switchVersionReg = /^(?:[A-Z]{3,})?(?<major>\d{4,})(?<minor>[a-z]*)(?:_cd(?<candidate>\d+))?(?:_rc(?<rcbuild>\d+))?(?:_b(?<build>\d+))?$/
  const group1 = cleanedCompareVersion?.match(switchVersionReg)?.groups
  const group2 = targetVersion?.match(switchVersionReg)?.groups
  if (group1 && group2) {
    let res = 0
    const keys = [MAJOR, MINOR, CANDIDATE, RCBUILD, BUILD]
    keys.every(key=>{
      const initValue = (key === CANDIDATE) ? '0' : (key === BUILD) ? '999' : ''
      const aValue = group1[key] || initValue
      const bValue = group2[key] || initValue
      res = aValue.localeCompare(bValue, 'en-u-kn-true') // sort by charCode and numeric

      if (key === RCBUILD && (
        (aValue && bValue === '' && !group2[BUILD]) ||
        (aValue === '' && !group1[BUILD] && bValue)
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
    const majorGroup = versionGroup[MAJOR]?.match(majorVersionReg)

    if (majorGroup && majorGroup.shift()) { // remove matched full string
      if (majorGroup[0].startsWith('0')) {
        majorGroup[0] = majorGroup[0].replace(/^0+/, '')
      }
      newVersionGroup.push(majorGroup.join('.'))
    }
    newVersionGroup.push(versionGroup[MINOR])
    newVersionGroup.push(versionGroup[BUILD])

    return newVersionGroup.join('')
  }
  return version
}

export const getSwitchModelGroup = (model: string): SwitchFirmwareModelGroup => {
  const modelLowerCase = model.toLowerCase()
  const prefixICX7X = ['ICX75', 'ICX76', 'ICX78']
  if (modelLowerCase.startsWith(SwitchFirmwareModelGroup.ICX71.toLowerCase())) {
    return SwitchFirmwareModelGroup.ICX71
  } else if (prefixICX7X.some(prefix => modelLowerCase.startsWith(prefix.toLowerCase()))) {
    return SwitchFirmwareModelGroup.ICX7X
  } else if (modelLowerCase.startsWith(SwitchFirmwareModelGroup.ICX81.toLowerCase())) {
    return SwitchFirmwareModelGroup.ICX81
  } else if (modelLowerCase.startsWith(SwitchFirmwareModelGroup.ICX82.toLowerCase())) {
    return SwitchFirmwareModelGroup.ICX82
  } else {
    return SwitchFirmwareModelGroup.ICX7X // Others
  }
}

type VersionMap = { [key: string]: string }

// Helper function to check if a string is empty or undefined
function isEmpty (str: string | undefined): boolean {
  return !str || str.length === 0
}

// eslint-disable-next-line max-len
const firmwarePattern = /(?:[A-Z]{3,})?(?<major>\d{4,})(?<minor>[a-z]*)(?:_cd(?<candidate>\d+))?(?:_b(?<build>\d+))?/
// eslint-disable-next-line max-len
const firmwarePatternForRelease = /(?:[A-Z]{3,})?(?<major>\d{4,})(?<minor>[a-z]*)(?:_rc(?<build>\d+))?/

function parseFirmwareVersion (fwString: string): VersionMap {
  // sanitize
  fwString = fwString.replace(/\.bin|ufi|\./g, '')

  const matcher = fwString.match(firmwarePattern)?.groups
  const matcherForRelease = fwString.match(firmwarePatternForRelease)?.groups
  const versionMap: VersionMap = {}
  if (!matcher || !matcherForRelease) {
    return versionMap
  }

  versionMap[MAJOR] = matcher[MAJOR]
  versionMap[MINOR] = matcher[MINOR] || ''
  versionMap[BUILD] = matcher[BUILD] || '999'
  versionMap[CANDIDATE] = matcher[CANDIDATE] || '0'
  if (matcher[BUILD]) {
    versionMap[IS_DEV_FIRMWARE] = 'Y'
  }
  if (matcherForRelease[BUILD]) {
    const releaseBuild = matcherForRelease[BUILD]
    versionMap[BUILD] = releaseBuild
    versionMap[IS_RELEASE_FIRMWARE] = 'Y'
  }
  return versionMap
}

function isReleaseFirmware (versionMap: VersionMap): boolean {
  return versionMap[IS_RELEASE_FIRMWARE] === 'Y'
}

function alreadyReleaseVersion (currentVerMap: VersionMap, targetVerMap: VersionMap): boolean {
  return currentVerMap[IS_RELEASE_FIRMWARE] === 'Y' && targetVerMap[IS_RELEASE_FIRMWARE] === 'Y'
}

export function isVerGEVer (currentVer: string, targetVer: string, considerBeta: boolean): boolean {
  if (isEmpty(currentVer)) {
    return false
  }

  const currentVerMap = parseFirmwareVersion(currentVer)
  const targetVerMap = parseFirmwareVersion(targetVer)

  const cMajor = parseInt(currentVerMap[MAJOR], 10)
  const tMajor = parseInt(targetVerMap[MAJOR], 10)
  const cMinor = currentVerMap[MINOR]
  const tMinor = targetVerMap[MINOR]

  if (cMajor === tMajor) {
    if (cMinor !== '' && cMinor === tMinor) {
      if (!considerBeta) {
        return true
      }
      if (alreadyReleaseVersion(currentVerMap, targetVerMap)) {
        return true
      }
      const cCandidate = parseInt(currentVerMap[CANDIDATE], 10)
      const tCandidate = parseInt(targetVerMap[CANDIDATE], 10)
      if (cCandidate === tCandidate) {
        const cRelease = isReleaseFirmware(currentVerMap)
        const tRelease = isReleaseFirmware(targetVerMap)
        if (cRelease === tRelease) {
          const cBuild = parseInt(currentVerMap[BUILD], 10)
          const tBuild = parseInt(targetVerMap[BUILD], 10)
          return cBuild >= tBuild
        }
        return cRelease
      }
      return cCandidate > tCandidate
    } else {
      const verList = [cMinor, tMinor]
      if(verList.every(item => item === '')){
        return true
      }
      verList.sort()
      return verList.indexOf(cMinor) > verList.indexOf(tMinor)
    }
  } else {
    return cMajor > tMajor
  }
}

export function getSwitchFwGroupVersionV1002 (
  fwV1002: FirmwareSwitchVenueVersionsV1002[], modelGroup: SwitchFirmwareModelGroup): string {
  return fwV1002?.find((fw) => fw.modelGroup === modelGroup)?.version ?? ''
}
