import { EdgeMvSdLanViewData, NetworkTypeEnum } from '@acx-ui/rc/utils'

import { NetworkTunnelSdLanAction } from '../../NetworkForm/utils'

export enum NetworkTunnelTypeEnum {
  None = 'None',
  SdLan = 'SdLan',
  SoftGre = 'SoftGre'
}

export interface NetworkTunnelActionModalProps {
  visible: boolean
  network?: {
    id: string,
    type: NetworkTypeEnum,
    venueId: string,
    venueName?: string,
  }
  onClose: () => void
  onFinish: (
    values: NetworkTunnelActionForm,
    otherData: {
      venueSdLan?: EdgeMvSdLanViewData
    }
  ) => Promise<void>
  cachedActs?: NetworkTunnelSdLanAction[]
}

export interface NetworkTunnelActionForm {
  tunnelType: NetworkTunnelTypeEnum
  sdLan: {
    isGuestTunnelEnabled: boolean
  }
}

export interface NetworkTunnelingActivation {
  serviceId: string
  venueId: string
  networkId: string
  isGuestTunnelUtilized: boolean
  activated: boolean
}