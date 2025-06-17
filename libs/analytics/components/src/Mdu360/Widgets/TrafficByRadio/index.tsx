import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { useAnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  HistoricalCard,
  ContentSwitcherProps,
  ContentSwitcher } from '@acx-ui/components'

import { TrafficSnapshot } from './TrafficSnapshot'
import { TrafficTrend }    from './TrafficTrend'

export function TrafficByRadio () {
  const { $t } = useIntl()
  const { filters } = useAnalyticsFilter()

  const trafficSnapshot = <AutoSizer>
    {({ height, width }) => (
      <div style={{ display: 'block', height, width }}>
        <TrafficSnapshot filters={filters}/>
      </div>
    )}
  </AutoSizer>

  const trafficTrend = <AutoSizer>
    {({ height, width }) => (
      <div style={{ display: 'block', height, width }}>
        <TrafficTrend filters={filters}/>
      </div>
    )}
  </AutoSizer>

  const tabDetails:ContentSwitcherProps['tabDetails']=[
    { label: $t({ defaultMessage: 'Snapshot' }), children: trafficSnapshot, value: 'Snapshot' },
    { label: $t({ defaultMessage: 'Trend' }), children: trafficTrend, value: 'Trend' }
  ]

  return (
    <HistoricalCard title={$t({ defaultMessage: 'Traffic By Radio' })}>
      <AutoSizer>
        {({ height, width }) => (
          <div style={{ display: 'block', height, width, margin: '-38px 0 0 0' }}>
            <ContentSwitcher tabDetails={tabDetails} align='right' size='small' />
          </div>
        )}
      </AutoSizer>
    </HistoricalCard>
  )
}