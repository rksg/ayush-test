import { Space }   from 'antd'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'
import styled      from 'styled-components/macro'

import { ContentSwitcher, ContentSwitcherProps, Tabs, Button } from '@acx-ui/components'
import { useIsSplitOn, Features }                              from '@acx-ui/feature-toggle'
import { EdgesTable }                                          from '@acx-ui/rc/components'
import { useParams, useTenantLink, useNavigate, TenantLink }   from '@acx-ui/react-router-dom'

import { VenueMeshApsTable } from './VenueMeshAps'
import { VenueRogueAps }     from './VenueRogueAps'


const SpaceWrapper = styled(Space)`
width: 100%;
margin: 12px 0px;
justify-content: flex-end;
`

export function VenueDevicesTab () {
  const { $t } = useIntl()
  const { venueId, activeSubTab } = useParams()
  const basePath = useTenantLink('')
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
      pathname: `${basePath.pathname}/venues/${venueId}/venue-details/devices/${tab}`
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

      { useIsSplitOn(Features.EDGES) && (
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'SmartEdge' })}
          key='edge'
        >
          <SpaceWrapper >
            <TenantLink to='/devices/edge/add' key='add'>
              <Button type='link'>{ $t({ defaultMessage: 'Add SmartEdge' }) }</Button>
            </TenantLink>
          </SpaceWrapper>

          <EdgesTable />
        </Tabs.TabPane>
      )}
    </Tabs>
  )
}
