import { RadioEnum, RadioTypeEnum } from '../../contents'
import { SchedulerTypeEnum }        from '../../models/SchedulerTypeEnum'
import { Venue, ApVenueStatusEnum } from '../../types'

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

export const checkVenuesNotInSetup = (networkAdvertisedVenues: Venue[]) => {
  const venuesNotInSetup = networkAdvertisedVenues?.filter(v => {
    return v.status !== ApVenueStatusEnum.IN_SETUP_PHASE
  })
  return venuesNotInSetup && venuesNotInSetup.length > 0
}
