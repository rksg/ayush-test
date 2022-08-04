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
