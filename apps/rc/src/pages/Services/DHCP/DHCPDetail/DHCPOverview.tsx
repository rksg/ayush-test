
import { useIntl } from 'react-intl'

import { SummaryCard }                                from '@acx-ui/components'
import { DHCPConfigTypeEnum, DHCPConfigTypeMessages } from '@acx-ui/rc/utils'

export default function DHCPOverView (props: { poolNumber:number | undefined,
  configureType: DHCPConfigTypeEnum | undefined }) {
  const { $t } = useIntl()

  const dhcpInfo = [
    {
      title: $t({ defaultMessage: 'Number of Pools' }),
      content: props.poolNumber
    },
    {
      title: $t({ defaultMessage: 'DHCP Configuration' }),
      content: props.configureType ? $t(DHCPConfigTypeMessages[props.configureType]):''
    }
  ]

  return <SummaryCard data={dhcpInfo} />
}

