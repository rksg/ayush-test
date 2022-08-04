import type { TimeStamp } from '@acx-ui/types'

import { severitiesDefinition } from '.'

export interface PathNode {
  type: string
  name?: string
}

export interface NetworkPath extends Array<PathNode> {}

export type IncidentSeverity = keyof typeof severitiesDefinition

export interface SeveritiesProps {
  gt: number
  lte: number
}

export interface MultiLineTimeSeriesChartData extends Object {
  name: string,
  data: [TimeStamp, number | '-'][]
}
