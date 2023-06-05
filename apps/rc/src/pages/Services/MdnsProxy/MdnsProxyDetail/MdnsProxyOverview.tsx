import { useIntl } from 'react-intl'

import { ServiceInfo }       from '@acx-ui/rc/components'
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

  return <ServiceInfo data={mdnsProxyInfo} />
}
