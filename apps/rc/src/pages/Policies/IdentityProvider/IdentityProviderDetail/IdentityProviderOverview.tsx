import { useIntl } from 'react-intl'

import { SummaryCard } from '@acx-ui/components'


export function IdentityProviderOverview () {
  const { $t } = useIntl()

  const snmpAgentInfo = [
    {
      title: $t({ defaultMessage: 'NAI Realm' }),
      content: (<div>tttttt</div>)
    },
    {
      title: $t({ defaultMessage: 'PLMN' }),
      content: (<div>1</div>)
    },
    {
      title: $t({ defaultMessage: 'Roaming Consortium OI' }),
      content: (<div>1</div>)
    },
    {
      title: $t({ defaultMessage: 'Authentication Service' }),
      content: (<div>1</div>)
    },
    {
      title: $t({ defaultMessage: 'Accounting Service' }),
      content: (<div>1</div>)
    }
  ]

  return (
    <SummaryCard data={snmpAgentInfo} />
  )
}