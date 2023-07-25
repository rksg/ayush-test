import { Dispatch, SetStateAction, memo } from 'react'

import moment    from 'moment-timezone'
import AutoSizer from 'react-virtualized-auto-sizer'

import { useAnalyticsFilter, getFilterPayload } from '@acx-ui/analytics/utils'
import { Card, ConfigChangeChart, Loader }      from '@acx-ui/components'
import type { ConfigChange }                    from '@acx-ui/components'

import { useConfigChangeQuery } from './services'

function BasicChart (props: {
  selected: ConfigChange | null,
  onClick: (params: ConfigChange) => void,
  onBrushPositionsChange: (params: number[][]) => void,
  chartZoom?: { start: number, end: number },
  setChartZoom?: Dispatch<SetStateAction<{ start: number, end: number } | undefined>>
}){
  const { filters: { filter, startDate, endDate } } = useAnalyticsFilter()
  const { selected, onClick } = props
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
            onDotClick={onClick}
            selectedData={selected?.id}
            onBrushPositionsChange={props.onBrushPositionsChange}
            chartZoom={props.chartZoom}
            setChartZoom={props.setChartZoom}
          />}
      </AutoSizer>
    </Card>
  </Loader>
}

export const Chart = memo(BasicChart)
