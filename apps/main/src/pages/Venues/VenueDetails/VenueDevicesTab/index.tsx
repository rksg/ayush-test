import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Tabs }                                  from '@acx-ui/components'
import {  useIsTierAllowed, Features }           from '@acx-ui/feature-toggle'
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
      type='second'>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Wi-Fi' })} key='wifi'>
        <div style={{ height: '100%', flex: 1, minHeight: '50vh' }}>
          <AutoSizer>
            {({ height, width }) => (
              <div style={{ width, height }}>
                <VenueWifi />
              </div>
            )}
          </AutoSizer>
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Switch' })}
        key='switch'>
        <VenueSwitch />
      </Tabs.TabPane>

      { useIsTierAllowed(Features.EDGES) && (
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'SmartEdge' })}
          key='edge'
        >
          <VenueEdge />
        </Tabs.TabPane>
      )}
    </Tabs>
  )
}
