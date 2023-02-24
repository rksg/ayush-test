import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { ContentSwitcher, ContentSwitcherProps, Tabs } from '@acx-ui/components'
import { useIsSplitOn, Features }                      from '@acx-ui/feature-toggle'
import { useNavigate, useParams, useTenantLink }       from '@acx-ui/react-router-dom'

import { VenueEdgesTable } from './VenueEdgesTable'
import { VenueRogueAps }   from './VenueRogueAps'
import { VenueSwitch }     from './VenueSwitch'
import { VenueWifi }       from './VenueWifi'


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

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'APs List' }),
      value: 'apsList',
      children: <VenueWifi />
    },
    {
      label: $t({ defaultMessage: 'AP Groups' }),
      value: 'apGroups',
      disabled: !useIsSplitOn(Features.DEVICES),
      children: <span>apGroups</span>
    },
    {
      label: $t({ defaultMessage: 'Rogue APs' }),
      value: 'rogueAps',
      disabled: !useIsSplitOn(Features.SERVICES),
      children: <VenueRogueAps />
    }
  ]

  return (
    <Tabs activeKey={activeSubTab}
      defaultActiveKey='wifi'
      onChange={onTabChange}
      type='card'>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Wi-Fi' })} key='wifi'>
        <div style={{ height: '100%', flex: 1, minHeight: '50vh' }}>
          <AutoSizer>
            {({ height, width }) => (
              <div style={{ width, height }}>
                <ContentSwitcher
                  defaultValue='apsList'
                  tabDetails={tabDetails}
                  size='small'
                  align='left'
                />
              </div>
            )}
          </AutoSizer>
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Switch' })}
        key='switch'
        disabled={!useIsSplitOn(Features.DEVICES)}>
        <VenueSwitch />
      </Tabs.TabPane>

      { useIsSplitOn(Features.EDGES) && (
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'SmartEdge' })}
          key='edge'
        >
          <VenueEdgesTable />
        </Tabs.TabPane>
      )}
    </Tabs>
  )
}
