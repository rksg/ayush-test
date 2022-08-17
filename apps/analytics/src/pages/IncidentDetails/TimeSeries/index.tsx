import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData }            from '@acx-ui/analytics/utils'
import { Card }                     from '@acx-ui/components'
import { Loader }                   from '@acx-ui/components'
import { MultiLineTimeSeriesChart } from '@acx-ui/components'
import { cssStr }                   from '@acx-ui/components'

import { codeToFailureTypeMap, failureCharts } from './config'
import { ChartDataProps, useChartsQuery }      from './services'

const lineColors = [
  cssStr('--acx-accents-blue-30'),
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50')
]

export const TimeSeries : React.FC<ChartDataProps> = ({ charts, incident }) => {
  const { $t } = useIntl()

  const seriesMapping = {
    incidentCharts: [
      { key: codeToFailureTypeMap[incident.code], name: $t({ defaultMessage: 'Code' }) },
      { key: 'startTime', name: $t({ defaultMessage: 'Start Time' }) },
      { key: 'endTime', name: $t({ defaultMessage: 'End Time' }) }
    ],
    clientCountCharts: [
      { key: 'newClientCount', name: $t({ defaultMessage: 'New Clients' }) },
      { key: 'impactedClientCount', name: $t({ defaultMessage: 'Impacted Clients' }) },
      { key: 'connectedClientCount', name: $t({ defaultMessage: 'Connected Clients' }) }
    ],
    attemptAndFailureCharts: [
      { key: 'totalFailureCount', name: $t({ defaultMessage: 'FailureCount' }) },
      { key: 'failureCount', name: $t({ defaultMessage: 'Total Failure' }) },
      { key: 'attemptCount', name: $t({ defaultMessage: 'Attempt Count' }) }
    ]
  }

  const incidentChart = ['incidentCharts', 'relatedIncidents']
  const filteredCharts = charts.filter(chart => !incidentChart.includes(chart))

  const queryResults = useChartsQuery({ charts, incident })

  return (
    <Loader states={[queryResults]}>
      {filteredCharts.map((chart) => {

        let queryData
        if (queryResults.data) {
          // if (chart === 'incidentCharts') {
          //   console.log('inside')
          //   queryData = {
          //     incidentCharts: {
          //       // startTime: queryResults.data?.['relatedIncidents'][0].startTime,
          //       // endTime: queryResults.data?.['relatedIncidents'][0].endTime,
          //       code: queryResults.data?.['incidentCharts'][codeToFailureTypeMap[incident.code]],
          //       time: queryResults.data?.['incidentCharts'].time
          //     }
          //   }
          //   console.log(queryData)
          //   const queryChart = getSeriesData(queryData.incidentCharts, seriesMapping[chart as keyof typeof seriesMapping])
          //   return <Card key={chart} title={$t(failureCharts[chart].title)} height={true}>
          //   <AutoSizer>
          //     {({ height, width }) => (
          //       <MultiLineTimeSeriesChart
          //         style={{ height, width }}
          //         data={queryChart}
          //         lineColors={lineColors}
          //       />
          //     )}
          //   </AutoSizer>
          // </Card>
          // }




          // combine incidentCharts with relatedIncidents
          // need marker for relatedIncidents

          queryData = queryResults.data[chart]
          const queryChart = getSeriesData(queryData,
            seriesMapping[chart as keyof typeof seriesMapping])
          console.log('queryChart', chart, queryChart)
          return <Card key={chart} title={$t(failureCharts[chart].title)} height={true}>
            <AutoSizer>
              {({ height, width }) => (
                <MultiLineTimeSeriesChart
                  style={{ height, width }}
                  data={queryChart}
                  lineColors={lineColors}
                />
              )}
            </AutoSizer>
          </Card>
        } else {
          return <></>
        }
      })}
    </Loader>
  )
}
