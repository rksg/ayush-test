import { useIntl } from 'react-intl'

import { PageHeader }            from '@acx-ui/components'
import { useGetClientListQuery } from '@acx-ui/rc/services'
import { useParams }             from '@acx-ui/react-router-dom'

import Tabs from './Tabs'

function Header () {
  const { $t } = useIntl()
  const { tenantId, venueId, serialNumber } = useParams()
  const defaultPayload = {
    filters: venueId ? { venueId: [venueId] } :
      serialNumber ? { serialNumber: [serialNumber] } : {}
  }

  // For display the total count, use query for a quick solution.
  // Might hitting timing issue and the count could be inconsistent with the size of client table
  const { data } = useGetClientListQuery({ params: { tenantId }, payload: defaultPayload }, {
    pollingInterval: 30_000
  })

  return (
    <PageHeader
      title={$t({ defaultMessage: 'WiFi' })}
      footer={<Tabs clientCount={data?.data ? data.data.length : 0}/>}
    />
  )
}

export default Header
