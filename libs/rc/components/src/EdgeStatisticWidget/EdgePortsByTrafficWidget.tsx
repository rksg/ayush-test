import _                           from 'lodash'
import { defineMessage, useIntl  } from 'react-intl'
import { useParams }               from 'react-router-dom'
import AutoSizer                   from 'react-virtualized-auto-sizer'

import { calculateGranularity }                                       from '@acx-ui/analytics/utils'
import { qualitativeColorSet }                                        from '@acx-ui/components'
import { DonutChart, HistoricalCard, Loader, NoData, DonutChartData } from '@acx-ui/components'
import { formatter }                                                  from '@acx-ui/formatter'
import { useGetEdgeTopTrafficQuery }                                  from '@acx-ui/rc/services'
import { EdgeTimeSeriesPayload }                                      from '@acx-ui/rc/utils'
import { useDateFilter }                                              from '@acx-ui/utils'

export function EdgePortsByTrafficWidget () {
  const { $t } = useIntl()
  const filters = useDateFilter()
  const params = useParams()

  const { data, isLoading } = useGetEdgeTopTrafficQuery({
    params: { serialNumber: params.serialNumber },
    payload: {
      start: filters?.startDate,
      end: filters?.endDate,
      granularity: calculateGranularity(filters?.startDate, filters?.endDate, 'PT15M')
    } as EdgeTimeSeriesPayload
  })
  const colors = qualitativeColorSet()
  const queryResults: DonutChartData[] = []
  data?.traffic.forEach((traffic, index) => {
    queryResults.push({
      name: `Port ${index + 1}`,
      value: traffic,
      color: colors[index]
    })
  })

  return (
    <Loader states={[{ isLoading }]}>
      <HistoricalCard title={$t({ defaultMessage: 'Top Ports by Traffic' })}>
        <AutoSizer>
          {(_.isEmpty(queryResults)) ?
            () =><NoData />:
            ({ height, width }) =>
              <DonutChart
                title={$t({ defaultMessage: 'Ports' })}
                style={{ width, height }}
                showLabel={true}
                showTotal={false}
                showLegend={false}
                data={queryResults}
                size={'x-large'}
                dataFormatter={formatter('bytesFormat')}
                tooltipFormat={defineMessage({
                  defaultMessage: `{name}<br></br>
                    <space><b>{formattedValue}</b> ({formattedPercent})</space>`
                })}
              />
          }
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}