export interface PathNode {
  type: string
  name?: string
}

export interface NetworkPath extends Array<PathNode> {}

export interface SeveritiesProps {
  gt: number
  lte: number
}

export interface IncidentDetailsMetadata {
  dominant: { ssid?: string }
  rootCauseChecks: {
    checks: Record<string,boolean>[]
    params: Record<string,string>
  }
}
