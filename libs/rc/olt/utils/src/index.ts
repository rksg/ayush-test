export * as OltFixtures from './__tests__'
export * from './types'

export enum OltSlotType {
  NT = 'NT',
  LT = 'LT'
}

export const OLT_PSE_SUPPLIED_POWER = 50 // PSE: Power Sourcing Equipment

export const oltLineCardOptions = [
  { label: 'PON LC 1', value: 'S1' },
  { label: 'PON LC 2', value: 'S2' }
]