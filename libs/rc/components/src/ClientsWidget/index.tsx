import { countBy, isEmpty }   from 'lodash'
import { IntlShape, useIntl } from 'react-intl'
import AutoSizer              from 'react-virtualized-auto-sizer'

import { cssStr, Loader, Card , DonutChart, GridRow, GridCol,
  getDeviceConnectionStatusColorsv2, StackedBarChart } from '@acx-ui/components'
import type { DonutChartData }                                   from '@acx-ui/components'
import { useDashboardOverviewQuery,useDashboardV2OverviewQuery } from '@acx-ui/rc/services'
import { ChartData, Dashboard }                                  from '@acx-ui/rc/utils'
import { useNavigateToPath, useParams }                          from '@acx-ui/react-router-dom'
import { useDashboardFilter, NetworkNodePath }                   from '@acx-ui/utils'

export const getAPClientChartData = (
  overviewData: Dashboard | undefined,
  { $t }: IntlShape
): DonutChartData[] => {
  const seriesMapping = [
    { name: $t({ defaultMessage: 'Poor' }), color: cssStr('--acx-semantics-red-50') },
    { name: $t({ defaultMessage: 'Average' }), color: cssStr('--acx-semantics-yellow-40') },
    { name: $t({ defaultMessage: 'Good' }), color: cssStr('--acx-semantics-green-50') },
    { name: $t({ defaultMessage: 'Unknown' }), color: cssStr('--acx-neutrals-50') }
  ] as Array<{ name: string, color: string }>

  const clientDto = overviewData?.summary?.clients?.clientDto
  if (isEmpty(clientDto)) return []

  const counts = countBy(clientDto, client => client.healthCheckStatus)
  const chartData: DonutChartData[] = []
  seriesMapping.forEach(({ name, color }) => {
    if(counts[name] && counts[name] > 0) {
      chartData.push({
        name,
        value: counts[name],
        color
      })
    }
  })
  return chartData
}

export const getAPClientStackedBarChartData = (
  overviewData: Dashboard | undefined,
  { $t }: IntlShape
): ChartData[] => {
  const seriesMapping = [
    { name: $t({ defaultMessage: 'Unknown' }) },
    { name: $t({ defaultMessage: 'Poor' }) },
    { name: $t({ defaultMessage: 'Average' }) },
    { name: $t({ defaultMessage: 'Good' }) }
  ] as Array<{ name: string, color: string }>

  const clientDto = overviewData?.summary?.clients?.clientDto.map(item=>{
    if(item.healthCheckStatus === undefined){
      return {
        ...item,
        healthCheckStatus: 'Unknown'
      }
    }
    return item
  })
  const counts = countBy(clientDto, client => client.healthCheckStatus)
  const series: ChartData['series'] = []
  seriesMapping.forEach(({ name }, index) => {
    series.push({
      name: `<${index}>${name}`,
      value: counts[name] || 0
    })
  })
  return [{
    category: '',
    series
  }]
}

export const getSwitchClientChartData = (
  overviewData: Dashboard | undefined,
  { $t }: IntlShape
): DonutChartData[] => {
  const chartData: DonutChartData[] = []
  const switchClients = overviewData?.summary?.switchClients
  if (switchClients && switchClients.totalCount > 0) {
    chartData.push({
      name: $t({ defaultMessage: 'Clients' }),
      value: switchClients.totalCount,
      color: cssStr('--acx-semantics-green-50')
    })
  }
  return chartData
}

export const getSwitchClientStackedBarChartData = (
  overviewData: Dashboard | undefined,
  { $t }: IntlShape
): ChartData[] => {
  const series: ChartData['series'] = []
  const switchClients = overviewData?.summary?.switchClients
  series.push({
    name: $t({ defaultMessage: 'Clients' }),
    value: switchClients?.totalCount || 0
  })
  return [{
    category: '',
    series
  }]
}

export function ClientsWidget () {
  const onArrowClick = useNavigateToPath('/users/')
  const intl = useIntl()
  const queryResults = useDashboardOverviewQuery({
    params: useParams()
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      ...rest,
      data: {
        apData: getAPClientChartData(data, intl),
        switchData: getSwitchClientChartData(data, intl)
      }
    })
  })

  const { $t } = intl
  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Clients' })} onArrowClick={onArrowClick}>
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'inline-flex' }}>
              <DonutChart
                style={{ width: width/2 , height }}
                title={$t({ defaultMessage: 'Wi-Fi' })}
                showLegend={false}
                data={queryResults.data.apData}/>
              <DonutChart
                style={{ width: width/2, height }}
                title={$t({ defaultMessage: 'Switch' })}
                showLegend={false}
                data={queryResults.data.switchData}/>
            </div>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export function ClientsWidgetV2 () {
  const onArrowClick = useNavigateToPath('/users/')
  const intl = useIntl()
  const { filters } = useDashboardFilter()
  const { filter: { networkNodes } } = filters
  const venueIds = networkNodes?.map((networkNode: NetworkNodePath) => networkNode[0].name)

  const queryResults = useDashboardV2OverviewQuery({
    params: useParams(),
    payload: {
      filters: {
        venueIds
      }
    }
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      ...rest,
      data: {
        apData: getAPClientStackedBarChartData(data, intl),
        switchData: getSwitchClientStackedBarChartData(data, intl),
        apClientCount: data?.summary?.clients?.totalCount || 0,
        switchClientCount: data?.summary?.switchClients?.totalCount || 0
      }
    })
  })
  const marginTop = '13px'
  const { $t } = intl
  const { apClientCount, apData, switchClientCount, switchData } = queryResults.data
  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Clients' })} onArrowClick={onArrowClick}>
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'block', height, width }}>
              <GridRow style={{ marginTop: '30px' }}>
                <GridCol col={{ span: 11 }} style={{ marginTop: marginTop }}>
                  { apClientCount > 0 ? $t({ defaultMessage: 'Wi-Fi' })
                    : $t({ defaultMessage: 'No Wi-Fi clients' }) }
                </GridCol>
                <GridCol col={{ span: 11 }}>
                  { apClientCount > 0 ? <StackedBarChart
                    style={{ height: (height/2) - 30 }}
                    data={apData}
                    showLabels={false}
                    showTotal={false}
                    barColors={getDeviceConnectionStatusColorsv2()} />
                    : <div style={{ height: (height/2) - 30 }}/>
                  }
                </GridCol>
                <GridCol col={{ span: 2 }} style={{ marginTop: marginTop, marginLeft: '-13px' }}>
                  {apClientCount || ''}
                </GridCol>
              </GridRow>
              <GridRow>
                <GridCol col={{ span: 11 }} style={{ marginTop: marginTop }}>
                  { switchClientCount > 0 ? $t({ defaultMessage: 'Wired' })
                    : $t({ defaultMessage: 'No Wired clients' }) }
                </GridCol>
                <GridCol col={{ span: 11 }}>
                  { apClientCount > 0 ? <StackedBarChart
                    style={{ height: (height/2) - 30 }}
                    data={switchData}
                    showLabels={false}
                    showTotal={false}
                    barColors={getDeviceConnectionStatusColorsv2()} />
                    : <div style={{ height: (height/2) - 30 }}/>
                  }
                </GridCol>
                <GridCol col={{ span: 2 }} style={{ marginTop: marginTop, marginLeft: '-13px' }}>
                  {switchClientCount || ''}
                </GridCol>
              </GridRow>
            </div>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
