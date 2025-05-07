import { useIntl } from 'react-intl'

import { PasswordInput, SummaryCard } from '@acx-ui/components'
import { SimpleListTooltip }          from '@acx-ui/rc/components'
import {
  IpSecAuthEnum,
  IpsecViewData,
  EspProposal,
  IkeProposal,
  IpSecProposalTypeEnum,
  IpSecEncryptionAlgorithmEnum
} from '@acx-ui/rc/utils'
import { noDataDisplay } from '@acx-ui/utils'


interface IpsecDetailContentProps {
  data: IpsecViewData
}

export default function IpsecDetailContent (props: IpsecDetailContentProps) {
  const { data } = props
  const { $t } = useIntl()

  const getIkeProposals = (proposals: IkeProposal[]) => {
    const retArr: string[] = []
    proposals?.forEach((proposal: IkeProposal) => {
      retArr.push(`${(proposal.encAlg === IpSecEncryptionAlgorithmEnum.THREE_DES ?
        '3DES' : proposal.encAlg)}-${proposal.authAlg}-${proposal.prfAlg}-${proposal.dhGroup}`)
    })
    return retArr
  }

  const getEspProposals = (proposals: EspProposal[]) => {
    const retArr: string[] = []
    proposals?.forEach((proposal: EspProposal) => {
      retArr.push(`${(proposal.encAlg === IpSecEncryptionAlgorithmEnum.THREE_DES ?
        '3DES' : proposal.encAlg)}-${proposal.authAlg}-${proposal.dhGroup}`)
    })
    return retArr
  }

  const ipsecInfo = [
    {
      title: $t({ defaultMessage: 'Security Gateway' }),
      content: data?.serverAddress || noDataDisplay
    },
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
    {
      title: $t({ defaultMessage: 'IKE Proposal' }),
      content: () => {
        const proposals = data?.ikeProposals?.length === 0 ?
          ['All'] : getIkeProposals(data?.ikeProposals)
        return <SimpleListTooltip items={proposals}
          displayText={data?.ikeProposalType === IpSecProposalTypeEnum.DEFAULT ?
            $t({ defaultMessage: 'Default' }) : $t({ defaultMessage: 'Custom' })} />
      }
    },
    {
      title: $t({ defaultMessage: 'ESP Proposal' }),
      content: () => {
        const proposals = data?.espProposals?.length === 0 ?
          ['All'] : getEspProposals(data?.espProposals)
        return <SimpleListTooltip items={proposals}
          displayText={data?.espProposalType === IpSecProposalTypeEnum.DEFAULT ?
            $t({ defaultMessage: 'Default' }) : $t({ defaultMessage: 'Custom' })} />
      }
    }
  ]

  return data ? <SummaryCard data={ipsecInfo} colPerRow={6} /> : null
}