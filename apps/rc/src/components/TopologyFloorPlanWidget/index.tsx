import { Tooltip } from 'antd'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card }                                  from '@acx-ui/components'
import { ContentSwitcher, ContentSwitcherProps } from '@acx-ui/components'
import { notAvailableMsg }                       from '@acx-ui/utils'

import FloorPlan from '../FloorPlan'

export default function TopologyFloorPlanWidget () {
  const { $t } = useIntl()
  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: <Tooltip title={$t(notAvailableMsg)}>
        {$t({ defaultMessage: 'Topology' })}
      </Tooltip>,
      value: 'topology',
      children: <span>Topology</span>,
      disabled: true
    },
    {
      label: $t({ defaultMessage: 'Floor Plans' }),
      value: 'floor-plans',
      children: <FloorPlan />
    }
  ]

  return (
    <Card>
      <AutoSizer>
        {({ height, width }) => (
          <div style={{ width, height }}>
            <ContentSwitcher
              defaultValue='floor-plans'
              tabDetails={tabDetails}
              size='small'
              align='left'
            />
          </div>
        )}
      </AutoSizer>
    </Card>
  )
}
