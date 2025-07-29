import { SLAKeys } from '../../types'

interface SLAResult {
  value: number | null
  isSynced: boolean
  error?: string
}

export type SLAData = Partial<{
  [key in SLAKeys]: SLAResult
}>

export interface QueryPayload {
  mspEcIds: string[];
}

export interface MutationPayload {
  mspEcIds: string[];
  slasToUpdate: Partial<Record<SLAKeys, number>>;
}
