/* eslint-disable max-len */
import { PhoneNumberType, PhoneNumberUtil } from 'google-libphonenumber'
import {
  isEqual,
  includes,
  remove,
  split
}                from 'lodash'

import { getIntl, validationMessages } from '@acx-ui/utils'

import { AclTypeEnum }                from './constants'
import { IpUtilsService }             from './ipUtilsService'
import { Acl, AclExtendedRule, Vlan } from './types'

const Netmask = require('netmask').Netmask

export function networkWifiIpRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp('^((22[0-3]|2[0-1][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9])\\.)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){2}((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.ipAddress))
  }
  return Promise.resolve()
}

export function serverIpAddressRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])){2}\.([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4])$/)
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.ipAddress))
  }
  return Promise.resolve()
}

export function generalIpAddressRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/)
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.ipAddress))
  }
  return Promise.resolve()
}

export function multicastIpAddressRegExp (value: string, isInverted?: boolean) {
  const { $t } = getIntl()

  if (value) {
    const ipLong = convertIpToLong(value)

    // outside 224.0.0.0 ~ 239.255.255.255
    if (ipLong < 3758096384 || ipLong > 4026531839) {
      return isInverted ? Promise.resolve() : Promise.reject($t(validationMessages.multicastIpAddress))
    } else {
      return isInverted ? Promise.reject($t(validationMessages.multicastIpAddressExcluded)) : Promise.resolve()
    }
  }

  return Promise.resolve()
}

export function networkWifiPortRegExp (value: number) {
  const { $t } = getIntl()
  if (value && value <= 0){
    return Promise.reject($t(validationMessages.validateEqualOne))
  } else if (value && value > 65535) {
    return Promise.reject($t(validationMessages.validateLowerThan65535))
  }
  return Promise.resolve()
}

export function networkWifiSecretRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('^[\\x21-\\x7E]+([\\x20-\\x7E]*[\\x21-\\x7E]+)*$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function URLRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('^(http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/)?[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?$')
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.validateURL))
  }
  return Promise.resolve()
}
export function URLProtocolRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('^https?:\\/\\/([A-Za-z0-9]+([\\-\\.]{1}[A-Za-z0-9]+)*\\.[A-Za-z]{2,}|(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])|localhost)(:([1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?(\\/.*)?([?#].*)?$')
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.validateURL))
  }
  return Promise.resolve()
}
export function domainNameRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp(/(^((22[0-3]|2[0-1][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9]?)\.)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){2}((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$)|(^(\b((?=[A-Za-z0-9-]{1,63}\.)(xn--)?[A-Za-z0-9]+(-[A-Za-z0-9]+)*\.)+[A-Za-z]{2,63}\b)$)/)
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.domain))
  }
  return Promise.resolve()
}
export function domainsNameRegExp (value: string[], required: boolean) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  if(!required) {
    return Promise.resolve()
  }
  const re = new RegExp(/(^((22[0-3]|2[0-1][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9]?)\.)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){2}((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$)|(^(\b((?=[A-Za-z0-9-]{1,63}\.)(xn--)?[A-Za-z0-9]+(-[A-Za-z0-9]+)*\.)+[A-Za-z]{2,63}\b)$)/)
  const isValid = value?.every?.(domain => {
    return !(required && !re.test(domain))
  })

  return isValid ? Promise.resolve() : Promise.reject($t(validationMessages.domains))
}

export function walledGardensRegExp (value:string) {
  const { $t } = getIntl()
  if (!value) {
    return Promise.resolve()
  }
  const walledGardens = value.split('\n')
  const walledGardenRegex = new RegExp(/^(((\*\.){0,1})(([a-zA-Z0-9*]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.){1,})([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9]){1,}(((\/[0-9]{1,2}){0,1}|(\s+(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){2,}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))))$/)
  const isValid = walledGardens.every(walledGarden=>{
    return !(walledGarden.trim()&&!walledGardenRegex.test(walledGarden.trim()))
  })
  return isValid ? Promise.resolve() : Promise.reject($t(validationMessages.walledGarden))
}
export function syslogServerRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('^(\\b([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\b)\\.(\\b([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\b)\\.(\\b([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\b)\\.(\\b([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\b)$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function trailingNorLeadingSpaces (value: string) {
  const { $t } = getIntl()
  if (value && (value.endsWith(' ') || value.startsWith(' '))) {
    return Promise.reject($t(validationMessages.leadingTrailingWhitespace))
  }
  return Promise.resolve()
}

export function hasGraveAccentAndDollarSign (value: string) {
  const { $t } = getIntl()
  if (value.includes('`') && value.includes('$(')) {
    return Promise.reject($t(validationMessages.hasGraveAccentAndDollarSign))
  } else if (value.includes('`')) {
    return Promise.reject($t(validationMessages.hasGraveAccent))
  } else if (value.includes('$(')) {
    return Promise.reject($t(validationMessages.hasDollarSign))
  }
  return Promise.resolve()
}

export function passphraseRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp('^[!-_a-~]((?!\\$\\()[ !-_a-~]){6,61}[!-_a-~]$|^[A-Fa-f0-9]{64}$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function checkObjectNotExists <ItemType> (
  list: ItemType[],
  value: ItemType,
  entityName: string,
  key = 'name',
  extra?: string
) {
  const { $t } = getIntl()
  if (list.filter(item => isEqual(item, value)).length !== 0) {
    return Promise.reject($t(validationMessages.duplication, { entityName, key, extra }))
  }
  return Promise.resolve()
}

export function checkItemNotIncluded (
  list: string[],
  value: string,
  entityName: string,
  exclusionItems: string
) {
  const { $t } = getIntl()
  if (list.filter(item => includes(value, item)).length !== 0) {
    return Promise.reject($t(validationMessages.exclusion, { entityName, exclusionItems }))
  }
  return Promise.resolve()
}

export function hexRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^[0-9a-fA-F]{26}$/)
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalidHex))
  }
  return Promise.resolve()
}

export function notAllDigitsRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^([0-9]+)$/)
  if (value!=='' && re.test(value)) {
    return Promise.reject($t(validationMessages.invalidNotAllDigits))
  }
  return Promise.resolve()
}

export function excludeExclamationRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^(?:(?!")(?!!)(?!\s).)*$/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.excludeExclamationRegExp))
  }
  return Promise.resolve()
}

export function excludeQuoteRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^(?:(?!").)*$/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.excludeQuoteRegExp))
  }
  return Promise.resolve()
}

export function excludeSpaceRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^(?:(?!\s).)*$/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.excludeSpaceRegExp))
  }
  return Promise.resolve()
}

export function excludeSpaceExclamationRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^(?:(?!!)(?!\s).)*$/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.excludeSpaceExclamationRegExp))
  }
  return Promise.resolve()
}

export function portRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^([1-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.portRegExp))
  }
  return Promise.resolve()
}

export function validateUsername (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^(?!admin$).*/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.validateUsername))
  }
  return Promise.resolve()
}

export function validateUserPassword (value: string) {
  const { $t } = getIntl()
  if (value && value.length >= 8) {
    let restriction = 0
    if (/[a-z]/.test(value)) { // lowercase
      restriction++
    }
    if (/[A-Z]/.test(value)) { // uppercase
      restriction++
    }
    if (/["#$%&'()*+,./:;<=>?@\^_`{|}~-]+/.test(value)) { // non-alphanumeric ASCII (Except ! and '')
      restriction++
    }
    if (/[0-9]/.test(value)) { // ASCII digits (numeric)
      restriction++
    }
    if (restriction !== 4) {
      return Promise.reject($t(validationMessages.validateUserPassword))
    }
    return Promise.resolve()
  } else {
    return Promise.resolve()
  }
}

export function generalSubnetMskRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('^(((255\.){3}(255|254|252|248|240|224|192|128|0+))|((255\.){2}(255|254|252|248|240|224|192|128|0+)\.0)|((255\.)(255|254|252|248|240|224|192|128|0+)(\.0+){2})|((255|254|252|248|240|224|192|128|0+)(\.0+){3}))$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.subnetMask))
  }
  return Promise.resolve()
}

export function subnetMaskIpRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('^((128|192|224|240|248|252|254)\.0\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0)|255\.(0|128|192|224|240|248|252|254)))))$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.subnetMask))
  }
  return Promise.resolve()
}

export function validateNetworkBaseIp (value: string, subnetMask: string) {
  if (!value || !subnetMask) {
    return Promise.resolve()
  }
  const { $t } = getIntl()
  const getSubnetInfo = (ipAddress: string, subnetMask: string) => {
    return new Netmask(ipAddress + '/' + subnetMask)
  }

  const subnetInfo = getSubnetInfo(value, subnetMask)

  if (!subnetInfo || subnetInfo.base === value) {
    return Promise.resolve()
  }

  return Promise.reject($t(validationMessages.isNotSubnetIp))
}

export function checkVlanMember (value: string) {
  const { $t } = getIntl()
  const items = value.toString().split(',')
  const isValid = items.map((item: string) => {
    const num = item.includes('-') ? item : Number(item)
    if (item.includes('-')) {
      const nums = item.split('-').map((x: string) => Number(x))
      return nums[1] > nums[0] && nums[1] < 4095 && nums[0] > 0
    }
    return num > 0 && num < 4095
  }).filter((x:boolean) => !x).length === 0

  if (isValid) {
    return Promise.resolve()
  }
  return Promise.reject($t(validationMessages.invalid))
}

export function checkVlanPoolMembers (value: string) {
  const { $t } = getIntl()
  if (value.length === 0) {
    return Promise.resolve()
  }

  const vlanMembers = split(value, ',')
  remove(vlanMembers, v => v.trim() === '')
  vlanMembers.sort((f: string, s: string) => {
    const ff = split(f, '-')
    const ss = split(s, '-')
    return (+ff[0] > +ss[0]) ? 1 : -1
  })

  if (vlanMembers.length === 0) {
    return Promise.resolve()
  }

  // vlan mumbers size should not exceed 16
  const vlanMembersMaxSize = 16
  if (vlanMembers.length > vlanMembersMaxSize) {
    return Promise.reject($t(validationMessages.vlanMembersMaxSize))
  }

  const vlanMembersMaxNumber = 64
  const vlanMemberRegex = /^(?:[2-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-3][0-9]{3}|40[0-8][0-9]|409[0-4])(?: *- *(?:[1-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-3][0-9]{3}|40[0-8][0-9]|409[0-4]))?(?: *, *(?:[1-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-3][0-9]{3}|40[0-8][0-9]|409[0-4])(?: *- *(?:[1-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-3][0-9]{3}|40[0-8][0-9]|409[0-4]))?)*$/
  let nextMember
  let previousMember = 0
  let totalNumberOfVlanMembers = 0
  for (let vlanMember of vlanMembers) {
    vlanMember = vlanMember.trim()

    // verify the validity of VLAN member based on regex
    if (!vlanMemberRegex.test(vlanMember)) {
      return Promise.reject($t(validationMessages.invalidVlanMember))
    }

    /** verify the validity of VLAN members based on vlan mumbers rules:
     * vlan mumbers range -> start value must be less than the end value
     * Overlapping between the vlan members is not allowed
     * vlan mumbers number should not exceed 64
     */
    const membersRange = split(vlanMember, '-')
    nextMember = +membersRange[0]
    totalNumberOfVlanMembers++
    if (previousMember >= nextMember) {
      return Promise.reject($t(validationMessages.vlanMembersOverlapping))
    }

    if (membersRange.length === 2) {
      previousMember = nextMember
      nextMember = +membersRange[1]

      if (previousMember >= nextMember) {
        return Promise.reject($t(validationMessages.invalidVlanMemberRange))
      }
      totalNumberOfVlanMembers += nextMember - previousMember
    }
    previousMember = nextMember

    if (totalNumberOfVlanMembers > vlanMembersMaxNumber) {
      return Promise.reject($t(validationMessages.vlanMembersMaxLength))
    }
  }

  return Promise.resolve()
}
export function checkValues (value: string, checkValue: string, checkEqual?: boolean) {
  const { $t } = getIntl()
  const valid = checkEqual ? isEqual(value, checkValue) : !isEqual(value, checkValue)
  if (value && !valid) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function apNameRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp('(?=^((?!`|\\$\\()[ -_a-~]){2,32}$)^(\\S.*\\S)$')
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function gpsRegExp (lat: string, lng: string) {
  const { $t } = getIntl()
  const latitudeRe = new RegExp('^$|^(-?(?:90(?:\\.0{1,6})?|(?:[1-8]?\\d(?:\\.\\d{1,6})?)))$')
  const longitudeRe = new RegExp('^$|^(-?(?:180(?:\\.0{1,6})?|(?:[1-9]?\\d(?:\\.\\d{1,6})?)|(?:1[0-7]?\\d(?:\\.\\d{1,6})?)))$')
  const errors: string[] = []

  if (!lat || !latitudeRe.test(lat)) {
    errors.push($t(validationMessages.gpsLatitudeInvalid))
  }

  if (!lng || !longitudeRe.test(lng)) {
    errors.push($t(validationMessages.gpsLongitudeInvalid))
  }

  if (errors.length > 0) {
    return Promise.reject(errors.join('. '))
  }

  return Promise.resolve()
}

export function serialNumberRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp('^[1-9][0-9]{11}$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function targetHostRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('(^((22[0-3]|2[0-1][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9]?)\\.)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){2}((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$)|(^(\\b((?=[a-z0-9-]{1,63}\\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,63}\\b)$)')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.targetHost))
  }
  return Promise.resolve()
}

export function MacAddressFilterRegExp (value: string){
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp(/^(?:[0-9A-Fa-f]{2}([-:]?))(?:[0-9A-Fa-f]{2}\1){4}[0-9A-Fa-f]{2}|([0-9A-Fa-f]{4}\.){2}[0-9A-Fa-f]{4}$/)
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function colonSeparatedMacAddressRegExp (value: string){
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp(/^[a-fA-F0-9]{2}(:[a-fA-F0-9]{2}){5}$/)
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.colonSeparatedMacInvalid))
  }
  return Promise.resolve()
}

export function MacRegistrationFilterRegExp (value: string){
  const { $t } = getIntl()
  const HYPHEN_2_GROUPS = new RegExp(/^([0-9A-Fa-f]{6})-([0-9A-Fa-f]{6})$/)
  const COLON_2_GROUPS = new RegExp(/^([0-9A-Fa-f]{6}):([0-9A-Fa-f]{6})$/)
  const COLON_6_GROUPS = new RegExp(/^([0-9A-Fa-f]{2}:){5}([0-9A-Fa-f]{2})$/)
  const HYPHEN_6_GROUPS = new RegExp(/^([0-9A-Fa-f]{2}-){5}([0-9A-Fa-f]{2})$/)
  const DOTS_3_GROUPS = new RegExp(/^([0-9A-Fa-f]{4}[.]){2}([0-9A-Fa-f]{4})$/)
  const HYPHEN_3_GROUPS = new RegExp(/^([0-9A-Fa-f]{4}[-]){2}([0-9A-Fa-f]{4})$/)
  const NO_DELIMITER = new RegExp(/^[0-9A-Fa-f]{12}$/)
  if (value && !
  (HYPHEN_2_GROUPS.test(value) ||
      COLON_2_GROUPS.test(value) ||
      COLON_6_GROUPS.test(value) ||
      HYPHEN_6_GROUPS.test(value) ||
      DOTS_3_GROUPS.test(value) ||
      HYPHEN_3_GROUPS.test(value) ||
      NO_DELIMITER.test(value))
  ) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function emailRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)

  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.emailAddress))
  }
  return Promise.resolve()
}

export function phoneRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp (/^\+[1-9]\d{1,14}$/)

  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.phoneNumber))
  }

  if (value && !ValidatePhoneNumber(value)){
    return Promise.reject($t(validationMessages.phoneNumber))
  }
  return Promise.resolve()
}

export function poeBudgetRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp ('^([1-8][0-9]{3}|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9]|[12][0-9]{4}|30000)$')

  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.poeBudget))
  }
  return Promise.resolve()
}

export function dscpRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp('^([0-9]|[1-5][0-9]|6[0-3])$')

  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.dscp))
  }
  return Promise.resolve()
}

export function priorityRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp('^([0-7])$')

  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.priority))
  }
  return Promise.resolve()
}

export function whitespaceOnlyRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp('\\S')

  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.whitespaceOnly))
  }
  return Promise.resolve()
}

export function agreeRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp('^agree$', 'i')

  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.agree))
  }
  return Promise.resolve()
}

export function nameCannotStartWithNumberRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^([0-9][A-Za-z0-9]*)$/)

  if (value && re.test(value)) {
    return Promise.reject($t(validationMessages.nameCannotStartWithNumber))
  }
  return Promise.resolve()
}

export function cliVariableNameRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^[A-Za-z0-9]*$/)

  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.nameInvalid))
  }
  return Promise.resolve()
}

export function cliIpAddressRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^([1-9]|[1-9]\d|1\d\d|2[0-2][0-3]|22[0-3])(\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])){2}\.([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4])$/)

  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.ipAddress))
  }
  return Promise.resolve()
}

export function subnetMaskPrefixRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/(^255\.255\.(0|128|192|224|24[08]|25[245])\.0$)|(^255\.255\.255\.(0|128|192|224|24[08]|252)$)/)

  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.subnetMaskBased255_255))
  }
  return Promise.resolve()
}

export function specialCharactersRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^[\.$A-Za-z0-9_ -]+$/)

  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.specialCharactersInvalid))
  }
  return Promise.resolve()
}

export function ValidatePhoneNumber (phoneNumber: string) {
  const phoneNumberUtil = PhoneNumberUtil.getInstance()
  let number
  let phoneNumberType
  try {
    number = phoneNumberUtil.parse(phoneNumber, '')
    phoneNumberType = phoneNumberUtil.getNumberType(number)
  } catch (e) {
    return false
  }
  if (!number) {
    return false
  } else {
    if (!phoneNumberUtil.isValidNumber(number) ||
      (phoneNumberType !== PhoneNumberType.MOBILE && phoneNumberType !== PhoneNumberType.FIXED_LINE_OR_MOBILE)) {
      return false
    }
  }
  return true
}

export const convertIpToLong = (ipAddress: string): number => {
  const ipArray = ipAddress.split('.').map(ip => parseInt(ip, 10))
  return ipArray[0] * 16777216 + ipArray[1] * 65536 + ipArray[2] * 256 + ipArray[3]
}

export const countIpSize = (startIpAddress: string, endIpAddress: string) => {
  const startLong = convertIpToLong(startIpAddress)
  const endLong = convertIpToLong(endIpAddress)
  return endLong - startLong + 1
}

export function countIpMaxRange (startIpAddress: string, endIpAddress: string) {
  const { $t } = getIntl()
  const maxRange = 1000

  const startLong = convertIpToLong(startIpAddress)
  const endLong = convertIpToLong(endIpAddress)

  const numIp = endLong - startLong + 1

  if (numIp <= 0) {
    return Promise.reject($t(validationMessages.ipRangeInvalid))
  } else if (numIp > maxRange) {
    return Promise.reject($t(validationMessages.ipRangeExceed, { range: maxRange }))
  }
  return Promise.resolve()
}

export function IpInSubnetPool (ipAddress: string, subnetAddress:string, subnetMask:string) {
  const { $t } = getIntl()
  const getSubnetInfo = (ipAddress: string, subnetMask: string) => {
    return new Netmask(ipAddress + '/' + subnetMask)
  }

  const subnetInfo = getSubnetInfo(subnetAddress, subnetMask)
  const firstIpLong = convertIpToLong(subnetInfo.first)
  const lastIpLong = convertIpToLong(subnetInfo.last)
  const testIpLong = convertIpToLong(ipAddress)

  if (testIpLong < firstIpLong || testIpLong > lastIpLong) {
    return Promise.reject($t(validationMessages.ipNotInSubnetPool))
  }
  return Promise.resolve()
}

export function validateSwitchIpAddress (ipAddress: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const IP_VALIDATION_PATTERN='(^((22[0-3]|2[0-1][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9]?)\\.)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){2}((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$)|(^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\\.([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}\\.[a-zA-Z]{2,3})$)'
  const ipRegexp = new RegExp(IP_VALIDATION_PATTERN)
  if (!ipRegexp.test(ipAddress)) {
    return Promise.reject($t(validationMessages.switchIpInvalid))
  }
  return Promise.resolve()
}

export function validateSwitchSubnetIpAddress (ipAddress: string, subnetAddress: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const ICX_SUBNET_MASK_PATTERN='^(((255\\.){3}(252|248|240|224|192|128|0+))|((255\\.){2}(255|254|252|248|240|224|192|128|0+)\\.0)|((255\\.)(255|254|252|248|240|224|192|128|0+)(\\.0+){2})|((255|254|252|248|240|224|192|128+)(\\.0+){3}))$'
  const subnetRegexp = new RegExp(ICX_SUBNET_MASK_PATTERN)
  if (!subnetRegexp.test(subnetAddress)) {
    return Promise.reject($t(validationMessages.switchIpInvalid))
  }else if(IpUtilsService.isBroadcastAddress(ipAddress, subnetAddress)){
    return Promise.reject($t(validationMessages.switchBroadcastAddressInvalid))
  }
  return Promise.resolve()
}

export function validateSwitchGatewayIpAddress (ipAddress: string, subnetAddress: string, gatewayAddress: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const IP_VALIDATION_PATTERN='(^((22[0-3]|2[0-1][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9]?)\\.)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){2}((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$)|(^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\\.([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}\\.[a-zA-Z]{2,3})$)'
  const ipRegexp = new RegExp(IP_VALIDATION_PATTERN)
  if (!ipRegexp.test(gatewayAddress)) {
    return Promise.reject($t(validationMessages.switchDefaultGatewayInvalid))
  }else if(!IpUtilsService.isInSameSubnet(ipAddress, subnetAddress, gatewayAddress)){
    return Promise.reject($t(validationMessages.switchSameSubnetInvalid))
  }
  return Promise.resolve()
}

// eslint-disable-next-line max-len
export const IP_SUBNET_VALIDATION_PATTERN='^(\\b([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\b)\\.(\\b([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\b)\\.(\\b([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\b)\\.(\\b([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\b)\\/([1-9]|[12]\\d|3[0-2])$'

export function validateSwitchStaticRouteIp (ipAddress: string) {
  const { $t } = getIntl()
  const ipRegexp = new RegExp(IP_SUBNET_VALIDATION_PATTERN)
  if (!ipRegexp.test(ipAddress)) {
    return Promise.reject($t(validationMessages.switchStaticRouteIpInvalid))
  }
  return Promise.resolve()
}

export function validateSwitchStaticRouteNextHop (ipAddress: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const nextHopRegexp = new RegExp(/^((1\.){3}([1-9]|[1-9]\d|[12]\d\d)|(1\.){2}([2-9]|[1-9]\d|[12]\d\d)\.([1-9]?\d|[12]\d\d)|1\.([2-9]|[1-9]\d|[12]\d\d)(\.([1-9]?\d|[12]\d\d)){2}|([2-9]|[1-9]\d|1\d\d|2[01]\d|22[0-3])(\.([1-9]?\d|[12]\d\d)){3})$/)
  // Next Hop accept "0.0.0.0".
  if (!nextHopRegexp.test(ipAddress) && ipAddress !== '0.0.0.0') {
    return Promise.reject($t(validationMessages.switchStaticRouteNextHopInvalid))
  }
  return Promise.resolve()
}

export function validateSwitchStaticRouteAdminDistance (ipAddress: string) {
  const { $t } = getIntl()
  const adRegexp = new RegExp('^([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])$')
  if (!adRegexp.test(ipAddress)) {
    return Promise.reject($t(validationMessages.switchStaticRouteAdminDistanceInvalid))
  }
  return Promise.resolve()
}

export function checkAclName (aclName: string, aclType: string) {
  const { $t } = getIntl()
  if (!isNaN(parseFloat(aclName)) && isFinite(parseFloat(aclName))) {
    try {
      const iName = parseInt(aclName, 10)
      if ((iName < 1 || iName > 99) && aclType === AclTypeEnum.STANDARD) {
        return Promise.reject($t(validationMessages.aclStandardNumericValueInvalid))
      }
      if ((iName < 100 || iName > 199) && aclType === AclTypeEnum.EXTENDED) {
        return Promise.reject($t(validationMessages.aclExtendedNumericValueInvalid))
      }
      return Promise.resolve()
    } catch (e) {
      return Promise.reject($t(validationMessages.aclNameStartWithoutAlphabetInvalid))
    }
  } else {
    if (!aclName.match(/^[a-zA-Z_].*/)) {
      return Promise.reject($t(validationMessages.aclNameStartWithoutAlphabetInvalid))
    }
    if (aclName.match(/.*[\"]/)) {
      return Promise.reject($t(validationMessages.aclNameSpecialCharacterInvalid))
    }
    if (aclName === 'test') {
      return Promise.reject($t(validationMessages.aclNameContainsTestInvalid))
    }
    return Promise.resolve()
  }
}

export function validateAclRuleSequence (sequence: number, currrentRecords: AclExtendedRule[]) {
  const { $t } = getIntl()
  if (currrentRecords.some(item => item.sequence === sequence)) {
    return Promise.reject($t(validationMessages.aclRuleSequenceInvalid))
  }
  return Promise.resolve()
}

export function validateDuplicateAclName (aclName: string, aclList: Acl[]) {
  const { $t } = getIntl()
  const index = aclList.filter(item => item.name === aclName)
  if (index.length > 0) {
    return Promise.reject($t(validationMessages.aclNameDuplicateInvalid))
  } else {
    return Promise.resolve()
  }
}

export function validateVlanId (vlanId: string){
  const { $t } = getIntl()
  const vlanRegexp = new RegExp('^([1-9]|[1-9][0-9]{1,2}|[1-3][0-9]{3}|40[0-8][0-9]|409[0-4])$') // Only 1 - 4094
  if (!vlanRegexp.test(vlanId)) {
    return Promise.reject($t(validationMessages.vlanRange))
  }
  return Promise.resolve()
}

export function validateVlanName (vlanName: string){
  const { $t } = getIntl()
  const vlanRegexp = new RegExp('^([1-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-3][0-9]{3}|40[0-7][0-9]|408[0-6]|4088|4089|4095)$')
  if (!vlanRegexp.test(vlanName)) {
    return Promise.reject($t(validationMessages.vlanNameInvalid))
  }
  return Promise.resolve()
}

export function validateDuplicateVlanName (vlanName: string, vlanList: Vlan[]) {
  const { $t } = getIntl()
  const index = vlanList.filter(item => item.vlanName === vlanName)
  if (index.length > 0) {
    return Promise.reject($t(validationMessages.aclNameDuplicateInvalid))
  } else {
    return Promise.resolve()
  }
}

export function validateDuplicateVlanId (vlanId: number, vlanList: Vlan[]) {
  const { $t } = getIntl()
  const index = vlanList.filter(item => item.vlanId.toString() === vlanId.toString())
  if (index.length > 0) {
    return Promise.reject($t(validationMessages.vlanIdInvalid))
  } else {
    return Promise.resolve()
  }
}

export function validateRecoveryPassphrasePart (value: string) {
  const { $t } = getIntl()

  if (!value) {
    return Promise.reject($t(validationMessages.invalid))
  }

  const spaceRegex = new RegExp(/.*\s+.*/)
  if (spaceRegex.test(value)) {
    return Promise.reject($t(validationMessages.recoveryPassphrasePartSpace))
  }

  const re = new RegExp(/^([0-9]{4})$/)
  if (!re.test(value)) {
    return Promise.reject($t(validationMessages.recoveryPassphrasePart))
  }

  return Promise.resolve()
}

export function validateVlanNameWithoutDVlans (vlanName: string) {
  const { $t } = getIntl()
  const re = new RegExp('^((?!^DEFAULT-VLAN$).)*$')
  if (!re.test(vlanName)) {
    return Promise.reject($t(validationMessages.vlanNameInvalidWithDefaultVlans))
  }

  return Promise.resolve()
}

export function isSubnetOverlap (firstIpAddress: string, firstSubnetMask:string,
  secondIpAddress: string, secondSubnetMask:string ) {
  const { $t } = getIntl()
  const getSubnetInfo = (ipAddress: string, subnetMask: string) => {
    return new Netmask(ipAddress + '/' + subnetMask)
  }

  let result = false
  let firstSubnetInfo
  let secondSubnetInfo
  try {
    firstSubnetInfo = getSubnetInfo(firstIpAddress, firstSubnetMask)
    secondSubnetInfo = getSubnetInfo(secondIpAddress, secondSubnetMask)
  } catch (error) {
    // ignore invalid case
    return Promise.resolve()
  }

  const firstStartLong = convertIpToLong(firstSubnetInfo.first)
  const firstEndLong = convertIpToLong(firstSubnetInfo.last)
  const secondStartLong = convertIpToLong(secondSubnetInfo.first)
  const secondEndLong = convertIpToLong(secondSubnetInfo.last)

  if(secondStartLong < firstStartLong) {
    result = secondEndLong > firstStartLong
  } else {
    result = secondStartLong < firstEndLong
  }

  return result ? Promise.reject($t(validationMessages.subnetOverlapping))
    : Promise.resolve()

}

export function validateTags (value: string[]) {
  const { $t } = getIntl()
  // eslint-disable-next-line no-control-regex
  const tagPattern = /^((([^\u0000-\u007F]|([a-zA-Z0-9]))+)[\!@#$%^&*(){}-]*)|([\!@#$%^&*(){}-]*(([^\u0000-\u007F]|([a-zA-Z0-9]))+))|([\!@#$%^&*(){}-]+)$/

  if(value === undefined || value.length === 0){
    return Promise.resolve()
  }

  if(value.length >= 24) {
    return Promise.reject($t(validationMessages.tagMaxLengthInvalid))
  }

  for (const tag of value) {
    if ((tagPattern.test(tag) || tag === '') && !tag.startsWith(' ') && !tag.endsWith(' ')
    && (tag.length === 0 || tag.length >= 2) && tag.length <= 64) {
      continue
    } else {
      return Promise.reject($t(validationMessages.tagInvalid))
    }
  }

  return Promise.resolve()
}

export function ipv6RegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/gi

  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.ipAddress))
  }
  return Promise.resolve()
}

export function servicePolicyNameRegExp (value: string) {
  const { $t } = getIntl()
  // regex from service and policy backend
  const re = new RegExp('(?=^((?!(`|\\$\\()).){2,32}$)^(\\S.*\\S)$')

  // make sure there is no special character in value
  if ([...value].length !== JSON.stringify(value).normalize().slice(1, -1).length) {
    return Promise.reject($t(validationMessages.specialCharacterNameInvalid))
  }

  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.servicePolicyNameInvalid))
  }
  return Promise.resolve()
}

