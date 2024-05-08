import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useIsTierAllowed, TierFeatures }        from '@acx-ui/feature-toggle'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { VenueEdge }   from './VenueEdge'
import { VenueSwitch } from './VenueSwitch'
import { VenueWifi }   from './VenueWifi'


export function VenueDevicesTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { activeSubTab, venueId } = useParams()
  const basePath = useTenantLink(`/venues/${venueId}/venue-details/devices`)

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
      type='card'
    >
      <Tabs.TabPane tab={$t({ defaultMessage: 'Wi-Fi' })} key='wifi'>
        <VenueWifi />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Switch' })}
        key='switch'>
        <VenueSwitch />
      </Tabs.TabPane>

      { useIsTierAllowed(TierFeatures.SMART_EDGES) && (
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'SmartEdge' })}
          key='edge'>
          <VenueEdge />
        </Tabs.TabPane>
      )}
    </Tabs>
  )
}
