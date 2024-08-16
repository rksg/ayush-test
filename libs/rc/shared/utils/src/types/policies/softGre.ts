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
  activationInformations: SoftGreActivationInformation[]
}

export interface VenueTableUsageBySoftGre extends SoftGreActivationInformation{
    name: string
    id: string
    addressLine: string
    networkIds: string[]
    networkNames: string[]
}


export interface SoftGreActivationInformation {
  venueId: string
  aaaAffinityEnabled: boolean
  networkIds: string[]
}

// export interface SoftGreNetworkVenueActivation {
//   id: string
//   networkVenue: SoftGreNetworkVenue
//   softGreProfile: SoftGre
//   aaaAffinityEnabled: boolean
// }
// export interface SoftGreNetworkVenue {
//   venueId: string
//   wifiNetworkId: string
// }

