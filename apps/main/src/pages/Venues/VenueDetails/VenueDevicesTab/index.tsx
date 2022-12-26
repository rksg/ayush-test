import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { ContentSwitcher, ContentSwitcherProps, Tabs } from '@acx-ui/components'
import { useIsSplitOn, Features }                      from '@acx-ui/feature-toggle'
import { useParams, useTenantLink, useNavigate }       from '@acx-ui/react-router-dom'

import { VenueMeshApsTable } from './VenueMeshAps'
import { VenueRogueAps }     from './VenueRogueAps'

export function VenueDevicesTab () {
  const { $t } = useIntl()
  const { venueId, activeSubTab } = useParams()
  const basePath = useTenantLink(`/venues/${venueId}/venue-details/devices`)
  const navigate = useNavigate()

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'APs List' }),
      value: 'apsList',
      children: <VenueMeshApsTable />
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

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (
    <Tabs
      defaultActiveKey='wifi'
      activeKey={activeSubTab}
      type='card'
      onChange={onTabChange}
    >
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
        {$t({ defaultMessage: 'Switch' })}
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'SmartEdge' })}
        key='edge'
        disabled={!useIsSplitOn(Features.EDGES)}>
        {$t({ defaultMessage: 'SmartEdge' })}
      </Tabs.TabPane>
    </Tabs>
  )
}
