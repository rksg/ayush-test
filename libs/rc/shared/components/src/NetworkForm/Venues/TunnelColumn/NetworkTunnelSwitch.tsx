import { Form } from 'antd'

import { EdgeMvSdLanViewData, NetworkSaveData, PersonalIdentityNetworksViewData, Venue } from '@acx-ui/rc/utils'

import {
  NetworkTunnelActionForm,
  NetworkTunnelTypeEnum,
  SoftGreNetworkTunnel,
  getNetworkTunnelType,
  NetworkTunnelSwitchBtn
} from '../../../NetworkTunnelActionModal'

import { handleSdLanTunnelAction, handleSoftGreTunnelAction } from './utils'

interface NetworkTunnelSwitchProps {
  currentVenue: Venue
  currentNetwork: NetworkSaveData
  // cachedVenueSdLanInfo is latest state with all actions applied on SD-LAN in NetworkForm
  cachedVenueSdLanInfo: EdgeMvSdLanViewData
  // venueSdLanInfo is the API responded data
  venueSdLanInfo: EdgeMvSdLanViewData
  venuePinInfo: PersonalIdentityNetworksViewData
  venueSoftGre: SoftGreNetworkTunnel[]
  onClick: (currentVenue: Venue, currentNetwork: NetworkSaveData) => void
}

export const NetworkTunnelSwitch = (props: NetworkTunnelSwitchProps) => {
  const {
    currentVenue, currentNetwork,
    cachedVenueSdLanInfo, venueSdLanInfo,
    venuePinInfo,
    venueSoftGre,
    onClick
  } = props

  const form = Form.useFormInstance()
  const venueId = currentVenue.id
  const networkId = currentNetwork.id

  const networkInfo = {
    id: networkId!,
    type: currentNetwork.type!,
    venueId: venueId,
    venueName: currentVenue.name
  }

  // eslint-disable-next-line max-len
  const tunnelType = getNetworkTunnelType(networkInfo, venueSoftGre, cachedVenueSdLanInfo, venuePinInfo)

  return <NetworkTunnelSwitchBtn
    tunnelType={tunnelType}
    venueSdLanInfo={cachedVenueSdLanInfo}
    onClick={(checked) => {
      if (checked) {
        onClick(currentVenue, currentNetwork)
      } else {
        const formValues = {
          tunnelType: NetworkTunnelTypeEnum.None,
          softGre: {
            oldProfileId: venueSoftGre?.[0]?.profileId
          }
        } as NetworkTunnelActionForm

        const args = {
          form,
          modalFormValues: formValues,
          networkInfo: networkInfo,
          otherData: { network: networkInfo, venueSdLan: cachedVenueSdLanInfo }
        }

        switch (tunnelType) {
          case NetworkTunnelTypeEnum.SdLan:
            handleSdLanTunnelAction(venueSdLanInfo, args)
            return
          case NetworkTunnelTypeEnum.SoftGre:
            handleSoftGreTunnelAction(args)
            return
          case NetworkTunnelTypeEnum.Pin:
          default:
            return
        }
      }
    }}
  />
}