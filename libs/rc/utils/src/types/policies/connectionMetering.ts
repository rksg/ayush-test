import {
    Persona
  } from '@acx-ui/rc/utils'

export type BillingCycleType = 'CYCLE_UNSPECIFIED' | 'CYCLE_MONTHLY' | 'CYCLE_WEEKLY' | 'CYCLE_NUM_DAYS'



export interface ConnectionMetering {
    id: string
    name: string
    uploadRate: number
    downloadRate: number
    dataCapacity: number
    dataCapacityThreshold: number
    dataCapacityEnforced: boolean
    billingCycleRepeat: boolean
    billingCycleType: BillingCycleType
    billingCycleDays: number | null
    unitCount?: number
    venueCount?: number
    personas?: Persona[]
}