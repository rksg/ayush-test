import { useIntl } from 'react-intl'

import { PageHeader }             from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { useSwitchListQuery }     from '@acx-ui/rc/services'
import { useParams }              from '@acx-ui/react-router-dom'

import Tabs from './Tabs'

function Header () {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()
  const navbarEnhancement = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const defaultPayload = {
    fields: ['name', 'id'],
    filters: venueId ? { venueId: [venueId] } : {}
  }
  const { data } = useSwitchListQuery({ params: { tenantId }, payload: defaultPayload }, {
    pollingInterval: 30_000
  })

  return (
    <>
      {navbarEnhancement && <PageHeader
        title={$t({ defaultMessage: 'Switches' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Wired' }), link: '' }
        ]}
        footer={<Tabs switchCount={data?.totalCount ? data?.totalCount : 0} />}
      />}
    </>
  )
}

export default Header
