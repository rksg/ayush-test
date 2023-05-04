import { defineMessage, useIntl } from 'react-intl'
import AutoSizer                  from 'react-virtualized-auto-sizer'

import { qualitativeColorSet }                                        from '@acx-ui/components'
import { DonutChart, HistoricalCard, Loader, NoData, DonutChartData } from '@acx-ui/components'
import { formatter }                                                  from '@acx-ui/formatter'
import { EdgeStatus }                                                 from '@acx-ui/rc/utils'

import { EdgePortsByTrafficWidgetMockData } from './__test__/fixture'

const getChartData = (edgeStatus: EdgeStatus | undefined): DonutChartData[] => {

  const chartData: DonutChartData[] = []

  if (!edgeStatus) {
    return chartData
  }

  // TODO Retrieve by API
  const traffic = EdgePortsByTrafficWidgetMockData.traffic

  const colors = qualitativeColorSet()

  traffic.forEach((traffic, index) => {
    chartData.push({
      name: `Port ${index + 1}`,
      value: traffic,
      color: colors[index]
    })
  })

  return chartData
}

export function EdgePortsByTrafficWidget ({ currentEdge, isLoading }:
   { currentEdge: EdgeStatus | undefined, isLoading: boolean }) {
  const { $t } = useIntl()

  const chartData = getChartData(currentEdge)

  return (
    <Loader states={[ { isLoading } ]}>
      <HistoricalCard title={$t({ defaultMessage: 'Top Ports by Traffic' })}>
        <AutoSizer>
          {({ height, width }) => ( chartData && chartData.length > 0 ?
            <DonutChart
              title={$t({ defaultMessage: 'Ports' })}
              style={{ width, height }}
              showLabel={true}
              showTotal={false}
              showLegend={false}
              data={chartData}
              size={'x-large'}
              dataFormatter={formatter('bytesFormat')}
              tooltipFormat={defineMessage({
                defaultMessage: `{name}<br></br>
                    <space><b>{formattedValue}</b> ({formattedPercent})</space>`
              })}
            />
            : <NoData />
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}