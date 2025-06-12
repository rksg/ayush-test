import { useState } from 'react'

import Card        from 'antd/lib/card/Card'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { TrafficByBand, TrafficByVolume } from '@acx-ui/analytics/components'
import { useAnalyticsFilter }             from '@acx-ui/analytics/utils'
import {
  getDefaultEarliestStart,
  GridRow,
  GridCol,
  Loader,
  PageHeader,
  RangePicker,
  Tabs,
  HistoricalCard,
  ContentSwitcherProps,
  ContentSwitcher} from '@acx-ui/components'
import { VenueFilter }                           from '@acx-ui/main/components'
import { useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { useDateFilter }                         from '@acx-ui/utils'
import type { AnalyticsFilter }                  from '@acx-ui/utils'

export function TrafficBy ({
  filters
}: {
  filters: AnalyticsFilter
}) {
  const { $t } = useIntl()

  const trafficByRadio = <AutoSizer>
    {({ height, width }) => (
      <div style={{ display: 'block', height, width }}>
        <TrafficByBand filters={filters}/>
      </div>
    )}
  </AutoSizer>

  const trafficByVolume = <AutoSizer>
    {({ height, width }) => (
      <div style={{ display: 'block', height, width }}>
        <TrafficByVolume filters={filters}/>
      </div>
    )}
  </AutoSizer>

  const tabDetails:ContentSwitcherProps['tabDetails']=[
    { label: $t({ defaultMessage: 'Radio' }), children: trafficByRadio, value: 'radio' },
    { label: $t({ defaultMessage: 'Volume' }), children: trafficByVolume, value: 'volume' }
  ]

  return (
    <HistoricalCard title={$t({ defaultMessage: 'Traffic By' })}>
      <AutoSizer>
        {({ height, width }) => (
          <div style={{ display: 'block', height, width, margin: '-38px 0 0 0' }}>
            {/* <TrafficByVolume filters={filters} /> */}
            <ContentSwitcher tabDetails={tabDetails}/>
          </div>
        )}
      </AutoSizer>
    </HistoricalCard>
  )
}