import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { ContentSwitcher, ContentSwitcherProps, Tabs } from '@acx-ui/components'

import { VenueMeshApsTable } from './VenueMeshAps'
import { VenueRogueAps }     from './VenueRogueAps'

export function VenueDevicesTab () {
  const { $t } = useIntl()
  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'APs List' }),
      value: 'apsList',
      children: <VenueMeshApsTable />
    },
    {
      label: $t({ defaultMessage: 'AP Groups' }),
      value: 'apGroups',
      children: <span>apGroups</span>
    },
    {
      label: $t({ defaultMessage: 'Rogue APs' }),
      value: 'rogueAps',
      children: <VenueRogueAps />
    }
  ]

  return (
    <Tabs
      defaultActiveKey='wifi'
      type='card'
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
      <Tabs.TabPane tab={$t({ defaultMessage: 'Switch' })} key='switch'>
        {$t({ defaultMessage: 'Switch' })}
      </Tabs.TabPane>
    </Tabs>
  )
}
