import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { Loader, MultiLineTimeSeriesChart, cssStr, NoData } from '@acx-ui/components'
import { formatter, intlFormats } from '@acx-ui/utils'

import { KPITimeseriesResponse, useKpiTimeseriesQuery } from './services'
import type { TimeStamp }                    from '@acx-ui/types'
import { kpiConfig } from './config'


const lineColors = [
  cssStr('--acx-accents-blue-30')
]

const transformResponse = ({ data, time }: KPITimeseriesResponse) => {
  return data.map((datum, index) => ([
    time[index],
    datum && datum.length && (datum[0] !== null && datum[1] !== null)
      ? datum[1] === 0 ? 0 : (datum[0] / datum[1])
      : '-'
  ])) as [TimeStamp, number][]

}
function KpiTimeseries ({ filters, kpi }: { filters: AnalyticsFilter, kpi: string }) {
  const { histogram } = Object(kpiConfig[kpi as keyof typeof kpiConfig])
  const queryResults = useKpiTimeseriesQuery(
    { ...filters, kpi, threshold: histogram?.initialThreshold }, {
    selectFromResult: ({ data, ...rest }) => ({
      ...rest,
      data: data! && [{
        name: kpiConfig[kpi as keyof typeof kpiConfig].text,
        data: transformResponse(data)
      }]    
    })
  })
 

  return (
    <Loader states={[queryResults]}>
      <AutoSizer>
        {({ height, width }) => (
          queryResults.data.length ?
            <MultiLineTimeSeriesChart
              style={{ height, width }}
              data={queryResults.data}
              lineColors={lineColors}
              //dataFormatter={formatter('percentFormat')}
              dataFormatter={(v) => v !== '-' ? formatter('percentFormat')(v) : '-'}
              yAxisProps={{ min: 0, max: 1 }}
              disableLegend
              
            />
            : <NoData/>
        )}
      </AutoSizer>
    </Loader>
  )
}

export default KpiTimeseries
