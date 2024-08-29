export enum NetworkTunnelTypeEnum {
  None = 'None',
  SdLan = 'SdLan',
  SoftGre = 'SoftGre'
}

export interface NetworkTunnelActionForm {
  tunnelType: NetworkTunnelTypeEnum
  sdLan: {
    isGuestTunnelEnabled: boolean
  },
  softGre: {
    newProfileId: string,
    oldProfileId: string
  }
}

export interface NetworkTunnelingActivation {
  serviceId: string
  venueId: string
  networkId: string
  isGuestTunnelUtilized: boolean
  activated: boolean
}