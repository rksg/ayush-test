import moment    from 'moment-timezone'
import AutoSizer from 'react-virtualized-auto-sizer'

import { useAnalyticsFilter }              from '@acx-ui/analytics/utils'
import { Card, ConfigChangeChart, Loader } from '@acx-ui/components'

import { useConfigChangeQuery } from './services'

export function Chart (){
  const { filters: { path, startDate, endDate } } = useAnalyticsFilter()
  const queryResults = useConfigChangeQuery({ path, start: startDate, end: endDate })

  return <Loader states={[queryResults]}>
    <Card type='no-border'>
      <AutoSizer>
        {({ width }) =>
          <ConfigChangeChart
            style={{ width }}
            data={queryResults.data ?? []}
            chartBoundary={[
              moment(startDate).valueOf(),
              moment(endDate).valueOf()
            ]}
            // TODO: need to handle sync betweem chart and table
            // onDotClick={(params) => console.log(params)}
          />}
      </AutoSizer>
    </Card>
  </Loader>
}