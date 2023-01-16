import { useIntl } from 'react-intl'

import { PageHeader } from '@acx-ui/components'
import { NetworkHealthTable } from './NetworkHealthTable'

function NetworkHealthPage () {
  const { $t } = useIntl()
  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Network Health' })}
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'Service Validation' }),
            link: '/serviceValidation/networkHealth'
          }
        ]}
      />
      <NetworkHealthTable />
    </>
  )
}

export { NetworkHealthPage }
