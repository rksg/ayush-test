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
  venueSdLanInfo: EdgeMvSdLanViewData
  venuePinInfo: PersonalIdentityNetworksViewData
  venueSoftGre: SoftGreNetworkTunnel[]
  onClick: (currentVenue: Venue, currentNetwork: NetworkSaveData) => void
}

export const NetworkTunnelSwitch = (props: NetworkTunnelSwitchProps) => {
  const {
    currentVenue, currentNetwork,
    venueSdLanInfo, venuePinInfo, venueSoftGre,
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
  const tunnelType = getNetworkTunnelType(networkInfo, venueSoftGre, venueSdLanInfo, venuePinInfo)
  // eslint-disable-next-line max-len
  const isTheLastSdLanWlan = (venueSdLanInfo?.tunneledWlans?.length ?? 0) === 1 && tunnelType === NetworkTunnelTypeEnum.SdLan
  const disabled = isTheLastSdLanWlan || tunnelType === NetworkTunnelTypeEnum.Pin

  return <NetworkTunnelSwitchBtn
    checked={tunnelType !== NetworkTunnelTypeEnum.None}
    disabled={disabled}
    tooltip={isTheLastSdLanWlan
      // eslint-disable-next-line max-len
      ? $t({ defaultMessage: 'Cannot deactivate the last network at this <venueSingular></venueSingular>' })
      : undefined}
    onClick={(checked) => {
      if (checked) {
        onClick(currentVenue, currentNetwork)
      } else {
        const formValues: NetworkTunnelActionForm = {
          tunnelType: NetworkTunnelTypeEnum.None,
          sdLan: {
            isGuestTunnelEnabled: venueSdLanInfo.isGuestTunnelEnabled!
          },
          softGre: {
            newProfileId: venueSoftGre?.[0]?.profileId,
            newProfileName: venueSoftGre?.[0]?.profileName,
            oldProfileId: venueSoftGre?.[0]?.profileId
          }
        }

        const args = {
          form,
          modalFormValues: formValues,
          networkInfo: networkInfo,
          otherData: { network: networkInfo, venueSdLan: venueSdLanInfo }
        }

        switch (tunnelType) {
          case NetworkTunnelTypeEnum.SdLan:
            handleSdLanTunnelAction(args)
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