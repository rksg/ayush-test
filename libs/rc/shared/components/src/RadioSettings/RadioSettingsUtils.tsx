/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { includes, intersection } from 'lodash'

import { SelectItemOption } from './RadioSettingsContents'

export const CorrectRadioChannels = (radioParams: any, supportChArray: any) => {
  const {
    allowedChannels,
    channelBandwidth,
    allowedIndoorChannels,
    allowedOutdoorChannels
  } = radioParams

  let newRadioRarams = { ...radioParams }
  const bandwidth = (channelBandwidth === 'AUTO')? 'auto' : channelBandwidth

  if (allowedIndoorChannels || allowedOutdoorChannels) {
    if (allowedIndoorChannels) {
      const supportIndoorChannels = supportChArray?.['indoor']?.[bandwidth]
      if (supportIndoorChannels) {
        newRadioRarams.allowedIndoorChannels = intersection(allowedIndoorChannels, supportIndoorChannels)
      } else {
        delete newRadioRarams.allowedIndoorChannels
      }
    }

    if (allowedOutdoorChannels) {
      const supportOutdoorChannels = supportChArray?.['outdoor']?.[bandwidth]
      if (supportOutdoorChannels) {
        newRadioRarams.allowedOutdoorChannels = intersection(allowedOutdoorChannels, supportOutdoorChannels)
      } else {
        delete newRadioRarams.allowedOutdoorChannels
      }
    }
  } else if (allowedChannels) { // 2.4G or legacy 6G allowedChannels
    const supportChannels = supportChArray?.[bandwidth]
    if (supportChannels) {
      newRadioRarams.allowedChannels = intersection(allowedChannels, supportChannels)
    } else {
      delete newRadioRarams.allowedChannels
    }
  }
  return newRadioRarams
}

export const GetSupportBandwidth = (bandwidthOptions: SelectItemOption[], availableChannels: any, apOptions?: any) => {
  const bandwidthList = Object.keys(availableChannels)

  if (apOptions) {
    const { isSupport160Mhz = false, isSupport320Mhz = false } = apOptions

    return bandwidthOptions.filter((option: SelectItemOption) => {
      const bandwidth = (option.value === 'AUTO') ? 'auto' : option.value

      if (bandwidth === '160MHz') {
        return isSupport160Mhz && includes(bandwidthList, bandwidth)
      }

      if (bandwidth === '320MHz') {
        return isSupport320Mhz && includes(bandwidthList, bandwidth)
      }

      return includes(bandwidthList, bandwidth)
    })
  }

  return bandwidthOptions.filter((option: SelectItemOption) => {
    const bandwidth = (option.value === 'AUTO') ? 'auto' : option.value

    return includes(bandwidthList, bandwidth)
  })
}

export const GetSupportIndoorOutdoorBandwidth = (bandwidthOptions: SelectItemOption[], availableChannels: any) => {
  const { indoor = {}, outdoor = {} } = availableChannels
  const indoorBandwidthList = Object.keys(indoor)
  const outdoorBandwidthList = Object.keys(outdoor)

  return bandwidthOptions.filter((option: SelectItemOption) => {
    const bandwidth = (option.value === 'AUTO') ? 'auto' : option.value

    return includes(indoorBandwidthList, bandwidth) || includes(outdoorBandwidthList, bandwidth)
  })
}