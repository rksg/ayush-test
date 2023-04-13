import { APMeshRole } from '@acx-ui/rc/utils'

export interface MeshConnectionInfoEntity {
  connectionType: 'Wired' | 'Wireless'
  from: string
  to: string
  fromMac: string
  toMac: string
  fromRole: APMeshRole
  toRole: APMeshRole
  fromSNR: number
  toSNR: number
  band: string
  channel: number
}

export enum SignalStrengthLevel {
  EXCELLENT,
  GOOD,
  LOW,
  POOR
}
