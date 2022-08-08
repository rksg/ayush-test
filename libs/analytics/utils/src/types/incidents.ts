import { incidentSeverities } from '..'

interface IncidentInformation {
  category: string
  subCategory: string
  shortDescription: string
  longDescription: string
  incidentType: string
}

export interface PathNode {
  type: string
  name?: string
}

export interface NetworkPath extends Array<PathNode> {}

export type IncidentSeverities = keyof typeof incidentSeverities

export interface SeverityRange {
  gt: number
  lte: number
}

export interface Metadata {
  dominant: { ssid?: string }
  rootCauseChecks: {
    checks: Record<string,boolean>[]
    params: Record<string,string>
  }
}

export interface IncidentDetailsProps {
  id: string
  sliceType: string
  sliceValue: string
  code: string
  startTime: string
  endTime: string
  severity: number
  clientCount: number
  impactedClientCount: number
  metadata: Metadata
  path: Array<{ type: string, name: string }>
  apCount: number
  impactedApCount: number
  switchCount: number
  vlanCount: number
  connectedPowerDeviceCount: number
  isMuted: boolean
  mutedBy: string|null
  mutedAt: Date|null
  slaThreshold: number|null
  currentSlaThreshold: number|null
}

export interface IncidentAttributesProps
  extends IncidentDetailsProps, IncidentInformation {
    visibleFields: string[]
  }
