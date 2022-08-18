import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData }            from '@acx-ui/analytics/utils'
import { Card }                     from '@acx-ui/components'
import { Loader }                   from '@acx-ui/components'
import { MultiLineTimeSeriesChart } from '@acx-ui/components'
import { cssStr }                   from '@acx-ui/components'
import { formatter }                from '@acx-ui/utils'

import { codeToFailureTypeMap, failureCharts } from './config'
import { ChartDataProps, useChartsQuery }      from './services'

const lineColors = [
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-blue-30'),
  cssStr('--acx-accents-orange-50')
]

export const TimeSeries : React.FC<ChartDataProps> = ({ charts, incident }) => {
  const { $t } = useIntl()
  const incidentTitle = codeToFailureTypeMap[incident.code].toUpperCase()
  const seriesMapping = {
    incidentCharts: [{
      key: codeToFailureTypeMap[incident.code],
      name: $t({ defaultMessage: '{title} Failures' }, { title: incidentTitle }) 
    }],
    clientCountCharts: [
      { key: 'newClientCount', name: $t({ defaultMessage: 'New Clients' }) },
      { key: 'impactedClientCount', name: $t({ defaultMessage: 'Impacted Clients' }) },
      { key: 'connectedClientCount', name: $t({ defaultMessage: 'Connected Clients' }) }
    ],
    attemptAndFailureCharts: [
      { key: 'totalFailureCount', name: $t({ defaultMessage: 'Total Failures' }) },
      { 
        key: 'failureCount',
        name: $t({ defaultMessage: '{title} Failures' }, { title: incidentTitle })
      },
      { 
        key: 'attemptCount',
        name: $t({ defaultMessage: '{title} Attempts' }, { title: incidentTitle })
      }
    ]
  }
  const incidentChart = ['relatedIncidents']
  const filteredCharts = charts.filter(chart => !incidentChart.includes(chart))
  const queryResults = useChartsQuery({ charts, incident })

  return (
    <Loader states={[queryResults]}>
      {filteredCharts.map((chart) => {
        if (queryResults.data) {
          if (incidentChart.includes('relatedIncidents') && chart === 'incidentCharts') {
            const combinedResults = {
              marker: queryResults.data['relatedIncidents'],
              incidentCharts: {
                ...queryResults.data[chart]
              } }
            const queryChart = getSeriesData(combinedResults[chart],
              seriesMapping[chart as keyof typeof seriesMapping])

            return <Card
              key={chart}
              title={$t({ defaultMessage: '{title}' }, { title: incidentTitle })}
              height={true}
            >
              <AutoSizer>
                {({ height, width }) => (
                  <MultiLineTimeSeriesChart
                    style={{ height, width }}
                    data={queryChart}
                    marker={combinedResults.marker}
                    dataFormatter={formatter('percentFormat')}
                    areaColor={'green'}
                  />
                )}
              </AutoSizer>
            </Card>
          }

          const queryData = queryResults.data[chart]
          const queryChart = getSeriesData(queryData,
            seriesMapping[chart as keyof typeof seriesMapping])

          return <Card key={chart} title={$t(failureCharts[chart].title)} height={true}>
            <AutoSizer>
              {({ height, width }) => (
                <MultiLineTimeSeriesChart
                  style={{ height, width }}
                  data={queryChart}
                  lineColors={lineColors}
                  dataFormatter={formatter('countFormat')}
                />
              )}
            </AutoSizer>
          </Card>
        } else {
          return <div></div>
        }
      })}
    </Loader>
  )
}
