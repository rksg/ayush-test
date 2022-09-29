import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card }                                  from '@acx-ui/components'
import { ContentSwitcher, ContentSwitcherProps } from '@acx-ui/components'

import FloorPlan from '../FloorPlan'

export default function TopologyFloorPlanWidget () {
  const { $t } = useIntl()
  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Topology' }),
      value: 'topology',
      children: <span>Topology</span>
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
