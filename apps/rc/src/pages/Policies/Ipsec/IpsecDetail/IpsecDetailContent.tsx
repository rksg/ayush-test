import { useIntl } from 'react-intl'

import { PasswordInput, SimpleListTooltip, SummaryCard }    from '@acx-ui/components'
import { getVxlanEspProposalText, getVxlanIkeProposalText } from '@acx-ui/edge/components'
import { Features }                                         from '@acx-ui/feature-toggle'
import {
  IpSecAuthEnum,
  IpsecViewData,
  IpSecProposalTypeEnum,
  getIkeProposalsDisplayText,
  getEspProposalsDisplayText,
  useIsEdgeFeatureReady,
  IpSecTunnelUsageTypeEnum
} from '@acx-ui/rc/utils'
import { noDataDisplay } from '@acx-ui/utils'

interface IpsecDetailContentProps {
  data: IpsecViewData
}

export default function IpsecDetailContent (props: IpsecDetailContentProps) {
  const { data } = props
  const { $t } = useIntl()
  const isEdgeIpsecVxLanReady = useIsEdgeFeatureReady(Features.EDGE_IPSEC_VXLAN_TOGGLE)

  const ipsecInfo = [
    ...isEdgeIpsecVxLanReady ? [{
      title: $t({ defaultMessage: 'Tunnel Usage Type' }),
      content: () => {
        const tunnelUsageTypeText = data?.tunnelUsageType === IpSecTunnelUsageTypeEnum.VXLAN_GPE ?
          $t({ defaultMessage: 'RUCKUS Devices (VxLAN)' }) :
          $t({ defaultMessage: '3rd Party Devices (SoftGRE)' })

        return data?.tunnelUsageType ? tunnelUsageTypeText : noDataDisplay
      }
    }]: [],
    ...(!isEdgeIpsecVxLanReady || data?.tunnelUsageType === IpSecTunnelUsageTypeEnum.SOFT_GRE) ? [{
      title: $t({ defaultMessage: 'Security Gateway' }),
      content: data?.serverAddress || noDataDisplay
    }]: [],
    {
      title: $t({ defaultMessage: 'Authentication' }),
      content: IpSecAuthEnum.PSK === data?.authenticationType ?
        $t({ defaultMessage: 'Pre-shared Key' }) :
        $t({ defaultMessage: 'Certificate' }) || noDataDisplay
    },
    {
      title: IpSecAuthEnum.PSK === data?.authenticationType ?
        $t({ defaultMessage: 'Pre-shared Key' }) : $t({ defaultMessage: 'Certificate' }),
      content: IpSecAuthEnum.PSK === data?.authenticationType ?
        <PasswordInput
          style={{ paddingLeft: 0, width: '50%', border: 'none' }}
          readOnly
          value={data?.preSharedKey} />
        : data?.certificate
    },
    ...(!isEdgeIpsecVxLanReady || data?.tunnelUsageType === IpSecTunnelUsageTypeEnum.SOFT_GRE) ? [{
      title: $t({ defaultMessage: 'IKE Proposal' }),
      content: () => {
        const proposals = getIkeProposalsDisplayText(data?.ikeProposals)
        return <SimpleListTooltip items={proposals}
          displayText={data?.ikeProposalType === IpSecProposalTypeEnum.DEFAULT ?
            $t({ defaultMessage: 'Default' }) : $t({ defaultMessage: 'Custom' })} />
      }
    },
    {
      title: $t({ defaultMessage: 'ESP Proposal' }),
      content: () => {
        const proposals = getEspProposalsDisplayText(data?.espProposals)
        return <SimpleListTooltip items={proposals}
          displayText={data?.espProposalType === IpSecProposalTypeEnum.DEFAULT ?
            $t({ defaultMessage: 'Default' }) : $t({ defaultMessage: 'Custom' })} />
      }
    }] : [],
    ...(isEdgeIpsecVxLanReady && data?.tunnelUsageType === IpSecTunnelUsageTypeEnum.VXLAN_GPE) ? [{
      title: $t({ defaultMessage: 'IKE Algorithm Combination' }),
      content: () => getVxlanIkeProposalText(data)
    }, {
      title: $t({ defaultMessage: 'ESP Algorithm Combination' }),
      content: () => getVxlanEspProposalText(data)
    } ] : []
  ]

  return data ? <SummaryCard data={ipsecInfo} colPerRow={6} /> : null
}
