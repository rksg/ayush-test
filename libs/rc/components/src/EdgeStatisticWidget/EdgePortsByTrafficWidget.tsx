import { useEffect, useState } from 'react'

import _                           from 'lodash'
import { defineMessage, useIntl  } from 'react-intl'
import { useParams }               from 'react-router-dom'
import AutoSizer                   from 'react-virtualized-auto-sizer'

import { calculateGranularity }                                       from '@acx-ui/analytics/utils'
import { qualitativeColorSet }                                        from '@acx-ui/components'
import { DonutChart, HistoricalCard, Loader, NoData, DonutChartData } from '@acx-ui/components'
import { formatter }                                                  from '@acx-ui/formatter'
import { useGetEdgeTopTrafficMutation }                               from '@acx-ui/rc/services'
import { EdgeTimeSeriesPayload }                                      from '@acx-ui/rc/utils'
import { useDateFilter }                                              from '@acx-ui/utils'

export function EdgePortsByTrafficWidget () {
  const { $t } = useIntl()
  const filters = useDateFilter()
  const params = useParams()

  const [loadingState, setLoadingState] = useState<boolean>(true)
  const [queryResults, setQueryResults] = useState<DonutChartData[]>([])

  const [trigger, { isLoading }] = useGetEdgeTopTrafficMutation()

  useEffect(() => {
    const initialWidget = async () => {
      await trigger({
        params: { serialNumber: params.serialNumber },
        payload: {
          start: filters?.startDate,
          end: filters?.endDate,
          granularity: calculateGranularity(filters?.startDate, filters?.endDate, 'PT15M')
        } as EdgeTimeSeriesPayload
      }).unwrap()
        .then((data) => {
          const colors = qualitativeColorSet()
          const chartData: DonutChartData[] = []
          data.traffic.forEach((traffic, index) => {
            chartData.push({
              name: `Port ${index + 1}`,
              value: traffic,
              color: colors[index]
            })
          })
          setLoadingState(isLoading)
          setQueryResults(chartData)
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
        })
    }
    initialWidget()
  }, [filters])

  if (_.isEmpty(queryResults)) {
    return (
      <Loader states={[{ isLoading: loadingState }]}>
        <HistoricalCard title={$t({ defaultMessage: 'Top Ports by Traffic' })}>
          <AutoSizer>
            {() =><NoData />}
          </AutoSizer>
        </HistoricalCard>
      </Loader>
    )
  }

  return (
    <Loader states={[{ isLoading: loadingState }]}>
      <HistoricalCard title={$t({ defaultMessage: 'Top Ports by Traffic' })}>
        <AutoSizer>
          {({ height, width }) =>
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