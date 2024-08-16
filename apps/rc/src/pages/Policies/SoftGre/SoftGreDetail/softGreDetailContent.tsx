import { useIntl } from 'react-intl'

import { SummaryCard }                   from '@acx-ui/components'
import { MtuTypeEnum,  SoftGreViewData } from '@acx-ui/rc/utils'

interface SoftGreDetailContentProps {
  data: SoftGreViewData | undefined
}
const SoftGreDetailContent = (props: SoftGreDetailContentProps) => {
  const { data } = props
  const { $t } = useIntl()

  const softGreInfo = [
    {
      title: $t({ defaultMessage: 'Description' }),
      content: data?.description ?? '-'
    },
    {
      title: $t({ defaultMessage: 'Primary Gateway' }),
      content: data?.primaryGatewayAddress
    },
    {
      title: $t({ defaultMessage: 'Secondary Gateway' }),
      content: data?.secondaryGatewayAddress
    },
    {
      title: $t({ defaultMessage: 'Disassociate Clientes' }),
      content: data?.disassociateClientEnabled ?
        $t({ defaultMessage: 'On' }) :
        $t({ defaultMessage: 'Off' })
    },
    {
      title: $t({ defaultMessage: 'Gateway Path MTU Mode' }),
      content: MtuTypeEnum.AUTO === data?.mtuType ?
        $t({ defaultMessage: 'Auto' }) :
        `${$t({ defaultMessage: 'Manual' })} (${data?.mtuSize})`
    },
    {
      title: $t({ defaultMessage: 'Keep Alive' }),
      content: `${data?.keepAliveInterval ?? '' } ${$t({ defaultMessage: 'seconds' })}/ `+
      `${data?.keepAliveRetryTimes ?? ''} ${$t({ defaultMessage: 'retries' })}`
    }
  ]

  return (
    <>
      {data && <SummaryCard data={softGreInfo} colPerRow={6} />}
    </>
  )
}

export default SoftGreDetailContent