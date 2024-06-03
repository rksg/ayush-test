/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { intersection } from 'lodash'

export const CorrectRadioChannels = (radioParams: any, supportChArray: any) => {
  const {
    allowedChannels,
    channelBandwidth,
    allowedIndoorChannels,
    allowedOutdoorChannels
  } = radioParams

  let newRadioRarams = { ...radioParams }
  const bandwidth = (channelBandwidth === 'AUTO')? 'auto' : channelBandwidth

  if (allowedChannels) {
    const supportChannels = supportChArray?.[bandwidth] ?? []
    newRadioRarams.allowedChannels = intersection(allowedChannels, supportChannels)
  } else {
    if (allowedIndoorChannels) {
      const supportIndoorChannels = supportChArray?.['indoor']?.[bandwidth] ?? []
      newRadioRarams.allowedIndoorChannels = intersection(allowedIndoorChannels, supportIndoorChannels)
    }

    if (allowedOutdoorChannels) {
      const supportOutdoorChannels = supportChArray?.['outdoor']?.[bandwidth] ?? []
      newRadioRarams.allowedOutdoorChannels = intersection(allowedOutdoorChannels, supportOutdoorChannels)
    }
  }
  return newRadioRarams
}