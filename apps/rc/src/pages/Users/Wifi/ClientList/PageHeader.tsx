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
  const { data } = useGetClientListQuery({ params: { tenantId }, payload: defaultPayload })

  return (
    <PageHeader
      title={$t({ defaultMessage: 'WiFi' })}
      footer={<Tabs clientCount={data?.data ? data.data.length : 0}/>}
    />
  )
}

export default Header
