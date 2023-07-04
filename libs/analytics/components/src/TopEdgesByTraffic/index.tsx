import { CallbackDataParams } from 'echarts/types/dist/shared'
import { useIntl }            from 'react-intl'
import AutoSizer              from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, BarChartData, calculateGranularity, getBarChartSeriesData } from '@acx-ui/analytics/utils'
import { BarChart, EventParams, HistoricalCard, Loader, NoData, cssNumber, cssStr }   from '@acx-ui/components'
import { formatter }                                                                  from '@acx-ui/formatter'
import { useGetEdgesTopTrafficQuery }                                                 from '@acx-ui/rc/services'
import { NavigateFunction, Path, useNavigate, useTenantLink }                         from '@acx-ui/react-router-dom'
import { FilterNameNode }                                                             from '@acx-ui/utils'

export { TopEdgesByTrafficWidget as TopEdgesByTraffic }

function edgeTrafficLabelFormatter (params: CallbackDataParams): string {
  const usage = Array.isArray(params.data) && params.data[params?.encode?.['x'][0]!]
  return '{traffic|' +formatter('bytesFormat')(usage) + '}'
}

const getEdgeTrafficRichStyle = () => ({
  traffic: {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-neutral-brand-font'),
    fontSize: cssNumber('--acx-body-5-font-size'),
    lineHeight: cssNumber('--acx-body-5-line-height'),
    fontWeight: cssNumber('--acx-body-5-font-weight')
  }
})

const seriesMapping: BarChartData['seriesEncode'] = [
  { x: 'Transmitted', y: 'name', seriesName: 'Transmitted' },
  { x: 'Received', y: 'name', seriesName: 'Received' }
]

export const onClick = (navigate: NavigateFunction, basePath: Path) => {
  return (params: EventParams) => {
    const serial = params.componentType ==='series' && Array.isArray(params.value)
      && params.value[1]
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${serial}/details/overview`
    })
  }
}

function TopEdgesByTrafficWidget ({ filters }: { filters : AnalyticsFilter }) {
  const { $t } = useIntl()
  const basePath = useTenantLink('/devices/edge/')
  const navigate = useNavigate()
  const queryResults = useGetEdgesTopTrafficQuery({
    payload: {
      start: filters?.startDate,
      end: filters?.endDate,
      granularity: calculateGranularity(filters?.startDate, filters?.endDate, 'PT15M'),
      venueIds: filters?.filter?.networkNodes?.flatMap(
        item => item.map(v => (v as FilterNameNode).name)
      )
    }
  },
  {
    selectFromResult: ({ data, ...rest }) => {
      const trafficData = data?.topTraffic ?
        data.topTraffic.map(item => ({
          name: item.name,
          serial: item.serial,
          Received: item.rxBytes,
          Transmitted: item.txBytes
        })) :
        []
      return{
        data: getBarChartSeriesData(trafficData,seriesMapping, 'name'),
        ...rest
      }
    }
  })
  const { data } = queryResults

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Top 5 SmartEdges by Traffic' })}>
        <AutoSizer>
          {({ height, width }) => (
            data && data.source?.length
              ?
              <BarChart
                barWidth={8}
                data={data}
                grid={{ right: '7%' }}
                labelFormatter={edgeTrafficLabelFormatter}
                labelRichStyle={getEdgeTrafficRichStyle()}
                onClick={onClick(navigate,basePath)}
                style={{ width, height }}
              />:
              <NoData/>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}