import { useIntl } from 'react-intl'

import { SummaryCard }       from '@acx-ui/components'
import { MdnsProxyFormData } from '@acx-ui/rc/utils'

export interface MdnsProxyOverviewProps {
  data: MdnsProxyFormData
}

export function MdnsProxyOverview (props: MdnsProxyOverviewProps) {
  const { $t } = useIntl()
  const { data } = props

  const mdnsProxyInfo = [
    {
      title: $t({ defaultMessage: 'Forwarding Rules' }),
      content: data.rules?.length
    }
  ]

  return <SummaryCard data={mdnsProxyInfo} />
}
