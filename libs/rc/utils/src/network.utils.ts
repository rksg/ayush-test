import { SchedulerTypeEnum } from './models/SchedulerTypeEnum'

import { RadioEnum, RadioTypeEnum } from '.'

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