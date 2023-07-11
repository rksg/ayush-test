import moment    from 'moment-timezone'
import AutoSizer from 'react-virtualized-auto-sizer'

import { useAnalyticsFilter, getFilterPayload } from '@acx-ui/analytics/utils'
import { Card, ConfigChangeChart, Loader }      from '@acx-ui/components'
import type { ConfigChange }                    from '@acx-ui/components'

import { useConfigChangeQuery } from './services'

export function Chart (props: {
  selectedRow: ConfigChange | null,
  onClick: (params: ConfigChange) => void,
}){
  const { filters: { filter, startDate, endDate } } = useAnalyticsFilter()
  const { selectedRow, onClick } = props
  const queryResults = useConfigChangeQuery({
    ...getFilterPayload({ filter }),
    start: startDate,
    end: endDate
  })

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
            onDotClick={(params) => {
              onClick(params)
            }}
            selectedData={selectedRow?.id}
          />}
      </AutoSizer>
    </Card>
  </Loader>
}