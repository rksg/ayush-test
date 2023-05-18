import { useIntl } from 'react-intl'

import { PageHeader }             from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { useNetworkListQuery }    from '@acx-ui/rc/services'
import { useParams }              from '@acx-ui/react-router-dom'

import Tabs from './Tabs'

function Header () {
  const { $t } = useIntl()
  const { tenantId, venueId, serialNumber } = useParams()
  const navbarEnhancement = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const defaultPayload = {
    filters: venueId ? { venueId: [venueId] } :
      serialNumber ? { serialNumber: [serialNumber] } : {}
  }
  const { data } = useNetworkListQuery({ params: { tenantId }, payload: defaultPayload }, {
    pollingInterval: 30_000
  })

  return (<>
    {navbarEnhancement && <PageHeader
      title={$t({ defaultMessage: 'Wi-Fi Networks' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Wi-Fi' }) }
      ]}
      footer={<Tabs networkCount={data?.totalCount ? data?.totalCount : 0} />}
    />}
  </>
  )
}

export default Header
