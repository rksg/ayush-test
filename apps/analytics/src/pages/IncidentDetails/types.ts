import { IncidentDetailsMetadata, NetworkPath, codeToFailureTypeMap } from '@acx-ui/analytics/utils'

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
  code: keyof typeof codeToFailureTypeMap
  startTime: string
  endTime: string
  severity: number
  clientCount: number
  impactedClientCount: number
  metadata: IncidentDetailsMetadata
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

interface IncidentInformation {
  category: string
  subCategory: string
  shortDescription: string
  longDescription: string
  incidentType: string
}

export interface IncidentAttributesProps
  extends IncidentDetailsProps, IncidentInformation {
    visibleFields: string[]
  }
