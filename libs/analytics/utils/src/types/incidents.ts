import { incidentSeverities } from '..'

interface IncidentInformation {
  category: string
  subCategory: string
  shortDescription: string
  longDescription: string
  incidentType: string
}

export type NodeType = 'network'
  | 'apGroupName'
  | 'apGroup'
  | 'zoneName'
  | 'zone'
  | 'switchGroup'
  | 'switch'
  | 'apMac'
  | 'ap'
  | 'AP'

export interface PathNode {
  type: NodeType
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
  sliceType: NodeType
  sliceValue: string
  code: string
  startTime: string
  endTime: string
  severity: number
  clientCount: number
  impactedClientCount: number
  metadata: Metadata
  path: NetworkPath
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
