import { useIntl } from 'react-intl'

import { StatusLight }               from '@acx-ui/rc/components'
import { EdgeDhcpServiceStatusEnum } from '@acx-ui/rc/utils'


type EdgeDHCPServiceStatusLightProps = {
  data: string
}

export const EdgeDHCPServiceStatusLight = (props: EdgeDHCPServiceStatusLightProps) => {

  const { $t } = useIntl()

  const EdgeDHCPServiceStatusLightConfig = {
    [EdgeDhcpServiceStatusEnum.UNKNOWN]: {
      color: 'var(--acx-neutrals-50)',
      text: $t({ defaultMessage: 'Unknown' })
    },
    [EdgeDhcpServiceStatusEnum.REQUIRES_ATTENTION]: {
      color: 'var(--acx-accents-orange-50)',
      text: $t({ defaultMessage: 'Requires Attention' })
    },
    [EdgeDhcpServiceStatusEnum.GOOD]: {
      color: 'var(--acx-semantics-green-50)',
      text: $t({ defaultMessage: 'Good' })
    },
    [EdgeDhcpServiceStatusEnum.POOR]: {
      color: 'var(--acx-semantics-red-50)',
      text: $t({ defaultMessage: 'Poor' })
    }
  }

  return (
    <StatusLight config={EdgeDHCPServiceStatusLightConfig} data={props.data} />
  )
}
