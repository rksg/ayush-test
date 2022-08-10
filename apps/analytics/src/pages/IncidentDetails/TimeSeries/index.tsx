import { defineMessage, useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { useGlobalFilter }          from '@acx-ui/analytics/utils'
import { getSeriesData }            from '@acx-ui/analytics/utils'
import { Card }                     from '@acx-ui/components'
import { Loader }                   from '@acx-ui/components'
import { MultiLineTimeSeriesChart } from '@acx-ui/components'
import { cssStr }                   from '@acx-ui/components'

import { ClientCountCharts }     from './services'
import { useClientCountChartQuery } from './services'

export const seriesMapping = ($t: CallableFunction) => ([
  { key: 'newClientCount', name: $t({ defaultMessage: 'New Clients' }) },
  { key: 'impactedClientCount', name: $t({ defaultMessage: 'Impacted Clients' }) },
  { key: 'connectedClientCount', name: $t({ defaultMessage: 'Connected Clients' }) }
] as Array<{ key: keyof Omit<ClientCountCharts, 'time'>, name: string }>)

const lineColors = [
  cssStr('--acx-accents-blue-30'),
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50')
]

export interface TimeSeriesType {
  type: 'clients' | 'failures' | 'detailed-failures'
}

function TimeSeries (type: TimeSeriesType) {
  const filters = useGlobalFilter()
  const { $t } = useIntl()
  const queryResults = useClientCountChartQuery(filters,
    {
      selectFromResult: ({ data, ...rest }) => ({
        data: getSeriesData(data!, seriesMapping($t)),
        ...rest
      })
    })

  const title = $t({ defaultMessage: 'Clients' })
  return (
    <Loader states={[queryResults]}>
      <Card title={title}>
        <AutoSizer>
          {({ height, width }) => (
            <MultiLineTimeSeriesChart
              style={{ width, height }}
              data={queryResults.data}
              lineColors={lineColors}
            />
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default TimeSeries
