import { useIntl } from 'react-intl'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { PageHeader }         from '@acx-ui/components'
import { SwitchClientsTable } from '@acx-ui/rc/components'

export default function ClientList () {
  const { $t } = useIntl()
  const navbarEnhancement = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const count = 123
  return <>
    <PageHeader
      title={navbarEnhancement
        ? $t({ defaultMessage: 'Wired ({count})' }, { count })
        : $t({ defaultMessage: 'Switch' })
      }
      breadcrumb={navbarEnhancement ?[
        { text: $t({ defaultMessage: 'Cients' }) }
      ] : []}
    />
    <SwitchClientsTable filterByVenue={true} filterBySwitch={true} />
  </>
}
