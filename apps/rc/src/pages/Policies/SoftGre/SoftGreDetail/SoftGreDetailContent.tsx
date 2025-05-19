import { isUndefined } from 'lodash'
import { useIntl }     from 'react-intl'

import { SummaryCard }                   from '@acx-ui/components'
import { MtuTypeEnum,  SoftGreViewData } from '@acx-ui/rc/utils'
import { noDataDisplay }                 from '@acx-ui/utils'

interface SoftGreDetailContentProps {
  data: SoftGreViewData | undefined
}
export default function SoftGreDetailContent (props: SoftGreDetailContentProps) {
  const { data } = props
  const { $t } = useIntl()

  const softGreInfo = [
    {
      title: $t({ defaultMessage: 'Description' }),
      content: data?.description || noDataDisplay
    },
    {
      title: $t({ defaultMessage: 'Primary Gateway' }),
      content: data?.primaryGatewayAddress || noDataDisplay
    },
    {
      title: $t({ defaultMessage: 'Secondary Gateway' }),
      content: data?.secondaryGatewayAddress || noDataDisplay
    },
    {
      title: $t({ defaultMessage: 'Fallback To Primary Gateway' }),
      content: data?.gatewayFailbackEnabled ?
        `${$t({ defaultMessage: 'On' })} (${data?.gatewaySecondaryToPrimaryTimer} ` +
        `${$t({ defaultMessage: 'mins' })})` :
        $t({ defaultMessage: 'Off' })
    },
    {
      title: $t({ defaultMessage: 'Disassociate Clients' }),
      content: data?.disassociateClientEnabled ?
        $t({ defaultMessage: 'On' }) :
        $t({ defaultMessage: 'Off' })
    },
    {
      title: $t({ defaultMessage: 'Gateway Path MTU Mode' }),
      content: MtuTypeEnum.MANUAL === data?.mtuType ?
        `${$t({ defaultMessage: 'Manual' })} (${data?.mtuSize})` :
        $t({ defaultMessage: 'Auto' })
    },
    {
      title: $t({ defaultMessage: 'Keep Alive' }),
      content: (!isUndefined(data?.keepAliveInterval) && !isUndefined(data?.keepAliveRetryTimes)) ?
        // eslint-disable-next-line max-len
        `${data?.keepAliveInterval} ${$t({ defaultMessage: 'seconds' })}/ ${data?.keepAliveRetryTimes} ${$t({ defaultMessage: 'retries' })}`
        : noDataDisplay
    }
  ]

  return data ? <SummaryCard data={softGreInfo} colPerRow={4} /> : null
}