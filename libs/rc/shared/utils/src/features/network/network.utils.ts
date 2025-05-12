import _             from 'lodash'
import { IntlShape } from 'react-intl'

import { NetworkTypeEnum, WlanSecurityEnum } from '../../constants'
import { RadioEnum, RadioTypeEnum }          from '../../contents'
import { SchedulerTypeEnum }                 from '../../models/SchedulerTypeEnum'
import { Network, NetworkSaveData }          from '../../types'

export const generateDefaultNetworkVenue = (venueId: string, networkId:string) => {
  return {
    apGroups: [],
    scheduler: {
      type: SchedulerTypeEnum.ALWAYS_ON
    },
    isAllApGroups: true,
    allApGroupsRadio: RadioEnum.Both,
    allApGroupsRadioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
    venueId,
    networkId
  }
}

export const generateHexKey = (keyLength: number):string => {
  let hexKey = ''
  const crypto = window.crypto
  const array = new Uint32Array(1)
  while (hexKey.length < keyLength) {
    hexKey += crypto.getRandomValues(array)[0].toString(16).substring(2)
  }
  return hexKey
}

export const generateAlphanumericString = (length: number) => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let generatedString = ''
  for (let i = 0; i < length; i++) {
    let randomNumber = Math.floor(Math.random() * chars.length)
    generatedString += chars.substring(randomNumber, randomNumber+1)
  }
  return generatedString
}

export const isOweTransitionNetwork = (data: Network | NetworkSaveData): boolean => {
  return data.isOweMaster === false && !_.isNil(data.owePairNetworkId)
}

export const isDsaeOnboardingNetwork = (data: Network | NetworkSaveData): boolean => {
  if (data.hasOwnProperty('isOnBoarded')) {
    return !!(data as Network).isOnBoarded
  } else {
    const _data = (data as NetworkSaveData)
    return _data.isDsaeServiceNetwork === false && !_.isNil(_data.dsaeNetworkPairId)
  }
}

// eslint-disable-next-line max-len
export const validateRadioBandForDsaeNetwork = (radios: string[], network: NetworkSaveData | undefined | null, intl: IntlShape) => {
  const { wlan, type } = network || {}
  if (wlan?.wlanSecurity
    && type === NetworkTypeEnum.DPSK
    && wlan?.wlanSecurity === WlanSecurityEnum.WPA23Mixed
    && radios.length
    && radios.length === 1
    && radios.includes(RadioTypeEnum._6_GHz)) {
    return Promise.reject(intl.$t({ defaultMessage:
    // eslint-disable-next-line max-len
        'Configure a <VenueSingular></VenueSingular> using only 6 GHz, in WPA2/WPA3 Mixed Mode DPSK Network, requires a combination of other Radio Bands. To use 6 GHz, other radios must be added.' }))
  }
  return Promise.resolve()
}
