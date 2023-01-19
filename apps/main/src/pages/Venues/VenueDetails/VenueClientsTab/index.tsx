import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useIsSplitOn, Features }                from '@acx-ui/feature-toggle'
import { ClientDualTable }                       from '@acx-ui/rc/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

export function VenueClientsTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { activeSubTab, venueId } = useParams()
  const basePath = useTenantLink(`/venues/${venueId}/venue-details/clients`)

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (
    <Tabs activeKey={activeSubTab}
      defaultActiveKey='wifi'
      onChange={onTabChange}
      type='card'>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Wi-Fi' })} key='wifi'>
        <ClientDualTable />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Switch' })}
        key='switch'
        disabled={!useIsSplitOn(Features.DEVICES)}>
        {$t({ defaultMessage: 'Switch' })}
      </Tabs.TabPane>
    </Tabs>
  )
}
