import { Hotspot20ConnectionCapabilityStatusEnum } from "./Hotspot20ConnectionCapabilityStatusEnum"

export interface Hotspot20ConnectionCapability {
    protocol?: string
    protocolNumber?: number
    port?: number
    status?: Hotspot20ConnectionCapabilityStatusEnum
  }