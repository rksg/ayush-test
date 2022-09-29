import { PathNode, NodeType } from '@acx-ui/utils'

import { AnalyticsFilter } from '../analyticsFilter'
import incidentSeverities  from '../incidentSeverities.json'

import type { IncidentCode }        from '../constants'
import type { IncidentInformation } from '../incidentInformation'

export type IncidentSeverities = keyof typeof incidentSeverities

export interface SeverityRange {
  gt: number
  lte: number
}

export interface IncidentMetadata {
  dominant?: { ssid?: string }
  rootCauseChecks?: {
    checks: Record<string,boolean>[]
    params: Record<string,string>
  }
}

export interface Incident extends IncidentInformation {
  id: string
  code: IncidentCode
  path: PathNode[]
  sliceType: NodeType
  sliceValue: string
  startTime: string
  endTime: string
  severity: number
  clientCount: number | null
  impactedClientCount: number | null
  apCount: number | null
  impactedApCount: number | null
  switchCount: number
  vlanCount: number
  connectedPowerDeviceCount: number
  metadata: IncidentMetadata
  isMuted: boolean
  mutedBy: string|null
  mutedAt: Date|null
  slaThreshold: number|null
  currentSlaThreshold: number|null
  relatedIncidents?: Incident[]
}

export interface IncidentAttributesProps
  extends Incident, IncidentInformation {
    visibleFields: string[]
  }

export type IncidentFilter = AnalyticsFilter & { code? : IncidentCode[] }
