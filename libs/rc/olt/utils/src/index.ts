import { Olt, OltStatusEnum } from './types'

export * from './__tests__'
export * from './types'

export const OLT_PSE_SUPPLIED_POWER = 50 // PSE: Power Sourcing Equipment

export const isOltValidSerialNumber = (serialNumber: string): boolean => !!serialNumber //TODO

export const isOltOnline = (oltDetails: Olt) =>
  oltDetails.status === OltStatusEnum.ONLINE
