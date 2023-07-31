import { memo } from 'react'

import moment    from 'moment-timezone'
import AutoSizer from 'react-virtualized-auto-sizer'

import { useAnalyticsFilter, getFilterPayload } from '@acx-ui/analytics/utils'
import { Card, ConfigChangeChart, Loader }      from '@acx-ui/components'

import { useConfigChangeQuery } from './services'

function BasicChart (props: {
  timeRanges: moment.Moment[],
  onBrushPositionsChange: (params: number[][]) => void
}){
  const [startDate, endDate] = props.timeRanges
  const { filters: { filter } } = useAnalyticsFilter()
  const queryResults = useConfigChangeQuery({
    ...getFilterPayload({ filter }),
    start: startDate.toISOString(),
    end: endDate.toISOString()
  })

  return <Loader states={[queryResults]}>
    <Card type='no-border'>
      <AutoSizer>
        {({ width }) =>
          <ConfigChangeChart
            style={{ width }}
            data={queryResults.data ?? []}
            chartBoundary={[ startDate.valueOf(), endDate.valueOf() ]}
            onBrushPositionsChange={props.onBrushPositionsChange}
            // TODO: need to handle sync betweem chart and table
            // onDotClick={(params) => console.log(params)}
          />}
      </AutoSizer>
    </Card>
  </Loader>
}

export const Chart = memo(BasicChart)
