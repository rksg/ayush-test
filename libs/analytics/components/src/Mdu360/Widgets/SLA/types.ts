import { SLAKeys } from '../../types'

export interface SLAResult {
  value: number | null
  isSynced: boolean
  error?: string
}

export type SLAData = Partial<{
  [key in SLAKeys]: SLAResult
}>

export interface QueryPayload {
  mspEcIds: string[]
}

export interface MutationPayload {
  mspEcIds: string[]
  slasToUpdate: Partial<Record<SLAKeys, number>>
}
export interface SLAConfig {
  splits?: number[]
  defaultValue?: number
  formatter?: (value: number) => number
  units?: { defaultMessage: string }
  title: { defaultMessage: string }
  apiMetric: string
}

export type SLAConfigWithData = SLAConfig &
  SLAResult & {
    slaKey: SLAKeys
    value: number
    splits: number[]
  }
