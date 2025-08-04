import { Olt, OltStatusEnum } from './types'

export * from './__tests__'
export * from './types'

export const isOltValidSerialNumber = (serialNumber: string): boolean => !!serialNumber //TODO
export const isOltOnline = (oltData: Olt) =>
  oltData.status === OltStatusEnum.ONLINE
