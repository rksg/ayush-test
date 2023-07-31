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
  timeRanges: moment.Moment[],
  onBrushPositionsChange: (params: number[][]) => void,
  chartZoom?: { start: number, end: number },
  setChartZoom?: Dispatch<SetStateAction<{ start: number, end: number } | undefined>>
  setInitialZoom?: Dispatch<SetStateAction<{ start: number, end: number } | undefined>>
}){
  const [startDate, endDate] = props.timeRanges
  const { filters: { filter } } = useAnalyticsFilter()
  const {
    selected, onClick, chartZoom, setChartZoom,
    setInitialZoom, onBrushPositionsChange
  } = props
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
            onDotClick={onClick}
            selectedData={selected?.id}
            onBrushPositionsChange={onBrushPositionsChange}
            chartZoom={chartZoom}
            setChartZoom={setChartZoom}
            setInitialZoom={setInitialZoom}
          />}
      </AutoSizer>
    </Card>
  </Loader>
}

export const Chart = memo(BasicChart)
