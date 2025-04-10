export enum NetworkTunnelTypeEnum {
  None = 'None',
  SdLan = 'SdLan',
  SoftGre = 'SoftGre',
  Pin = 'Pin'
}

export interface NetworkTunnelActionForm {
  tunnelType: NetworkTunnelTypeEnum
  sdLan: {
    isGuestTunnelEnabled: boolean,
    forwardingTunnelProfileId: string
    forwardingTunnelProfileType: string
  },
  softGre: {
    newProfileId: string,
    newProfileName: string,
    oldProfileId: string
  }
  ,
  ipsec?: {
    newProfileId: string,
    newProfileName: string,
    oldProfileId: string,
    enableIpsec: boolean
  }
}

export interface NetworkTunnelingActivation {
  serviceId: string
  venueId: string
  networkId: string
  isGuestTunnelUtilized: boolean
  activated: boolean
}