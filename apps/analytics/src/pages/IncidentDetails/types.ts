export interface Metadata {
  dominant: { ssid?: string }
  rootCauseChecks: {
    checks: Record<string,boolean>[]
    params: Record<string,string>
  }
}

export interface PathNode {
  type: string
  name: string
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
  path: Array<PathNode>
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

interface IncidentInformation {
  category: string
  subCategory: string
  shortDescription: string
  longDescription: string
  incidentType: string
}

export interface IncidentAttributesProps
  extends IncidentDetailsProps, IncidentInformation {}


