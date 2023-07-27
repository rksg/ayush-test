
import { MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { SummaryCard }   from '@acx-ui/components'
import { AAAPolicyType } from '@acx-ui/rc/utils'
const typeDescription: Record<string, MessageDescriptor> = {
  AUTHENTICATION: defineMessage({ defaultMessage: 'Authentication' }),
  ACCOUNTING: defineMessage({ defaultMessage: 'Accounting' })
}
export default function AAAOverview (props: { aaaProfile: AAAPolicyType }) {
  const { $t } = useIntl()
  const { aaaProfile } = props
  const aaaInfo = [
    {
      title: $t({ defaultMessage: 'Profile Type' }),
      content: $t(typeDescription[aaaProfile.type+''])
    },
    {
      title: $t({ defaultMessage: 'Primary IP Address' }),
      content: aaaProfile.primary?.ip
    },
    {
      title: $t({ defaultMessage: 'Primary Port' }),
      content: aaaProfile.primary?.port
    },
    {
      title: $t({ defaultMessage: 'Secondary IP Address' }),
      content: aaaProfile.secondary?.ip,
      visible: Boolean(aaaProfile.secondary)
    },
    {
      title: $t({ defaultMessage: 'Secondary Port' }),
      content: aaaProfile.secondary?.port,
      visible: Boolean(aaaProfile.secondary)
    }
  ]
  return <SummaryCard data={aaaInfo} />
}
