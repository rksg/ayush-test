import { NetworkPath } from '@acx-ui/utils'

export interface Mdu360TabProps {
  startDate: string
  endDate: string
}
export interface Mdu360Filter {
  path: NetworkPath
  start: string
  end: string
}
export interface DistributionData {
  apCount: number
  clientDistribution: Record<string, number|undefined>
}
export interface DistributionMatrix extends Record<string, DistributionData> {}