import { NetworkPath } from '@acx-ui/utils'

export type Mdu360TabPros = {
  startDate: string
  endDate: string
}

export type Mdu360Filter = {
  path: NetworkPath
  start: string
  end: string
}

export type DistributionData = {
  apCount: number
  clientDistribution: Record<string, number|undefined>
}
export type DistributionMatrix = Record<string, DistributionData>
