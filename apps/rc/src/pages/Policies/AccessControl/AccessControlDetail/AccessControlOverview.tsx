
import { useIntl } from 'react-intl'

import { SummaryCard }                          from '@acx-ui/components'
import { AccessControlInfoType, EnabledStatus } from '@acx-ui/rc/utils'

export default function AccessControlOverview (props: { data: AccessControlInfoType | undefined }) {
  const { $t } = useIntl()
  const { data } = props
  const accessControlInfo = [
    {
      title: $t({ defaultMessage: 'Layer 2' }),
      content: data && data.l2AclPolicy?.enabled ? EnabledStatus.ON : EnabledStatus.OFF
    },
    {
      title: $t({ defaultMessage: 'Layer 3' }),
      content: data && data.l3AclPolicy?.enabled ? EnabledStatus.ON : EnabledStatus.OFF
    },
    {
      title: $t({ defaultMessage: 'Device & OS' }),
      content: data && data.devicePolicy?.enabled ? EnabledStatus.ON : EnabledStatus.OFF
    },
    {
      title: $t({ defaultMessage: 'Applications' }),
      content: data && data.applicationPolicy?.enabled ? EnabledStatus.ON : EnabledStatus.OFF
    },
    {
      title: $t({ defaultMessage: 'Client Rate Limit' }),
      content: data && data.rateLimiting?.enabled ? EnabledStatus.ON : EnabledStatus.OFF
    }
  ]

  return <SummaryCard data={accessControlInfo} />
}
