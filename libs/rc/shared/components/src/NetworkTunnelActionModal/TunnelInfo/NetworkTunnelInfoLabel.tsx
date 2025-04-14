import { useIntl } from 'react-intl'

import {
  EdgeMvSdLanViewData,
  PersonalIdentityNetworksViewData,
  PolicyOperation,
  PolicyType,
  ServiceOperation,
  ServiceType,
  getPolicyDetailsLink,
  getServiceDetailsLink
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { NetworkTunnelActionModalProps }                  from '../NetworkTunnelActionModal'
import { NetworkTunnelTypeEnum }                          from '../types'
import { IpSecInfo, SoftGreNetworkTunnel }                from '../useSoftGreTunnelActions'
import { getNetworkTunnelType, getTunnelTypeDisplayText } from '../utils'

import { StyledTunnelInfoLabel } from './styledComponents'

interface NetworkTunnelInfoLabelProps {
  network: NetworkTunnelActionModalProps['network'],
  isVenueActivated: boolean,
  venueSdLan?: EdgeMvSdLanViewData,
  venueSoftGre?: SoftGreNetworkTunnel,
  venuePin?: PersonalIdentityNetworksViewData,
  venueIpSec?: IpSecInfo
}

export const NetworkTunnelInfoLabel = (props: NetworkTunnelInfoLabelProps) => {
  const { $t } = useIntl()
  const { network, isVenueActivated, venueSdLan, venueSoftGre, venuePin, venueIpSec } = props
  // eslint-disable-next-line max-len
  const tunnelType = getNetworkTunnelType(network, venueSoftGre ? [venueSoftGre] : undefined, venueSdLan, venuePin)

  if (!isVenueActivated || tunnelType === NetworkTunnelTypeEnum.None)
    return null

  const getProfileDetail = () => {
    switch (tunnelType) {
      case NetworkTunnelTypeEnum.SdLan:
        return venueSdLan
      case NetworkTunnelTypeEnum.SoftGre:
        return venueSoftGre
      case NetworkTunnelTypeEnum.Pin:
        return venuePin
      default:
        return undefined
    }
  }

  return <StyledTunnelInfoLabel>
    {venueIpSec?.profileId
      ? $t({ defaultMessage: '{tunnelType} ({profileName}, IPSec {ipsecProfileName})' },
        {
          tunnelType: getTunnelTypeDisplayText(tunnelType),
          profileName: getProfileDetailLink(tunnelType, venueSdLan || venuePin || venueSoftGre),
          ipsecProfileName: venueIpSec.profileId
            ? <TenantLink to={getPolicyDetailsLink({
              type: PolicyType.IPSEC,
              oper: PolicyOperation.DETAIL,
              policyId: venueIpSec.profileId!
            })}>
              {venueIpSec.profileName}
            </TenantLink>
            : venueIpSec.profileName
        })
      : $t({ defaultMessage: '{tunnelType} ({profileName})' },
        {
          tunnelType: getTunnelTypeDisplayText(tunnelType),
          profileName: getProfileDetailLink(tunnelType, getProfileDetail())
        })}</StyledTunnelInfoLabel>
}

const getProfileDetailLink = (
  tunnelType: NetworkTunnelTypeEnum | undefined,
  // eslint-disable-next-line max-len
  profileDetail: EdgeMvSdLanViewData | SoftGreNetworkTunnel | PersonalIdentityNetworksViewData | undefined
) => {

  switch (tunnelType) {
    case NetworkTunnelTypeEnum.SdLan:
      const sdLanData = (profileDetail as EdgeMvSdLanViewData)
      return sdLanData.id
        ? <TenantLink to={getServiceDetailsLink({
          type: ServiceType.EDGE_SD_LAN,
          oper: ServiceOperation.DETAIL,
          serviceId: sdLanData.id
        })}>
          {sdLanData.name}
        </TenantLink>
        : sdLanData.name

    case NetworkTunnelTypeEnum.SoftGre:
      const softGreData = (profileDetail as SoftGreNetworkTunnel)
      return softGreData.profileId
        ? <TenantLink to={getPolicyDetailsLink({
          type: PolicyType.SOFTGRE,
          oper: PolicyOperation.DETAIL,
          policyId: softGreData.profileId
        })}>
          {softGreData.profileName}
        </TenantLink>
        : softGreData.profileName

    case NetworkTunnelTypeEnum.Pin:
      const pinData = (profileDetail as PersonalIdentityNetworksViewData)
      return pinData.id
        ? <TenantLink to={getServiceDetailsLink({
          type: ServiceType.PIN,
          oper: ServiceOperation.DETAIL,
          serviceId: pinData.id
        })}>
          {pinData.name}
        </TenantLink>
        : pinData.name

    default:
      return ''
  }
}