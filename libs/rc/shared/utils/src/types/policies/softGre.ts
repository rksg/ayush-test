import { DefaultOptionType } from 'antd/lib/select'

import { MtuTypeEnum } from '../../models'

export interface SoftGre {
  id: string
  name: string
  description?: string
  primaryGatewayAddress: string
  secondaryGatewayAddress?: string
  mtuType: MtuTypeEnum
  mtuSize?: number
  keepAliveInterval: number
  keepAliveRetryTimes: number
  disassociateClientEnabled: boolean
}


export interface SoftGreViewData {
  id: string
  name: string
  description?: string
  primaryGatewayAddress: string
  secondaryGatewayAddress?: string
  mtuType: MtuTypeEnum
  mtuSize?: number
  keepAliveInterval: number
  keepAliveRetryTimes: number
  disassociateClientEnabled: boolean
  activations: SoftGreActivation[]
  venueActivations: SoftGreWiredActivation[]
  apActivations: SoftGreWiredApActivation[]
}

export interface VenueTableUsageBySoftGre extends SoftGreActivation {
    name: string
    id: string
    addressLine: string
    wifiNetworkNames: string[]
    apSerialNumbers: string[]
    apNames: string[]
}

export interface VenueTableSoftGreActivation {
  wifiNetworkIds: Set<string>
  apSerialNumbers: Set<string>
}

export interface SoftGreActivation {
  venueId: string
  wifiNetworkIds: string[]
}

export interface SoftGreOptionsData {
  options: DefaultOptionType[],
  id?: string,
  isLockedOptions: boolean,
  gatewayIpMaps: Record<string, string[]>,
  gatewayIps: string[]
  activationProfiles: string[]
}

export interface SoftGreWiredActivation {
  venueId: string
  apModel?: string
  apSerialNumbers: string[],
  portId: number
}

export interface SoftGreWiredApActivation {
  venueId: string
  apSerialNumber: string,
  portId: number
}