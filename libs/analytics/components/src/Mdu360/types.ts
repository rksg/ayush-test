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
  name:string
  apModels: Record<string, number>
}
export type DistributionMatrix = Record<string, Record<string, number>>
