import moment    from 'moment-timezone'
import AutoSizer from 'react-virtualized-auto-sizer'

import { useAnalyticsFilter }                       from '@acx-ui/analytics/utils'
import { Card, ConfigChangeChart as Chart, Loader } from '@acx-ui/components'

import { useConfigChangeQuery } from '../services'

export function ConfigChangeChart (){
  const { filters: { path, startDate, endDate } } = useAnalyticsFilter()
  const queryResults = useConfigChangeQuery({ path, start: startDate, end: endDate })

  return <Loader states={[queryResults]}>
    <Card type='no-border'>
      <AutoSizer>
        {({ width }) =>
          <Chart
            style={{ width: width - 250 }}
            data={queryResults.data ?? []}
            chartBoundary={[
              moment(startDate).valueOf(),
              moment(endDate).valueOf()
            ]}
            onDotClick={(params)=>{
              // TODO: need to handle sync betweem chart and table
              // eslint-disable-next-line no-console
              console.log(params)
            }}
          />}
      </AutoSizer>
    </Card>
  </Loader>
}