import { Space }              from 'antd'
import { countBy, isEmpty }   from 'lodash'
import { IntlShape, useIntl } from 'react-intl'
import AutoSizer              from 'react-virtualized-auto-sizer'

import { cssStr, Loader, Card , DonutChart, GridRow, GridCol,
  getDeviceConnectionStatusColorsv2, StackedBarChart } from '@acx-ui/components'
import type { DonutChartData }                                   from '@acx-ui/components'
import { useDashboardOverviewQuery,useDashboardV2OverviewQuery } from '@acx-ui/rc/services'
import { ChartData, Dashboard }                                  from '@acx-ui/rc/utils'
import { useNavigateToPath, useParams, TenantLink }              from '@acx-ui/react-router-dom'
import { useDashboardFilter }                                    from '@acx-ui/utils'

import * as UI from '../DevicesWidget/styledComponents'

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
      name: `<${index}>${name}`, // We need to add weightage to maintain the color order on stackbar chart
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
  const { venueIds } = useDashboardFilter()

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
  const { $t } = intl
  const { apClientCount, apData, switchClientCount, switchData } = queryResults.data
  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Clients' })} onArrowClick={onArrowClick}>
        <AutoSizer>
          {({ height, width }) => (
            <UI.WidgetContainer style={{ height, width }}>
              <GridRow style={{ display: 'flex', alignItems: 'center' }}>
                <GridCol col={{ span: apClientCount > 0 ? 9 : 12 }}>
                  { apClientCount > 0
                    ? $t({ defaultMessage: 'Wi-Fi' })
                    : $t({ defaultMessage: 'No Wi-Fi Clients' })
                  }
                </GridCol>
                <GridCol col={{ span: apClientCount > 0 ? 15 : 12 }}>
                  { apClientCount > 0
                    ? <Space>
                      <StackedBarChart
                        animation={false}
                        style={{
                          height: height / 2 - 30,
                          width: width / 2 - 15
                        }}
                        data={apData}
                        showLabels={false}
                        showTotal={false}
                        total={apClientCount}
                        barColors={getDeviceConnectionStatusColorsv2()} />
                      <TenantLink to={'/users/wifi/clients'}>
                        {apClientCount}
                      </TenantLink>
                    </Space>
                    : <div style={{ height: (height/2) - 30 }}/>
                  }
                </GridCol>
              </GridRow>
              <GridRow style={{ display: 'flex', alignItems: 'center' }}>
                <GridCol col={{ span: switchClientCount > 0 ? 9 : 12 }}>
                  { switchClientCount > 0
                    ? $t({ defaultMessage: 'Wired' })
                    : $t({ defaultMessage: 'No Wired Clients' })
                  }
                </GridCol>
                <GridCol col={{ span: switchClientCount > 0 ? 15 : 12 }}>
                  { switchClientCount > 0
                    ? <Space>
                      <StackedBarChart
                        animation={false}
                        style={{
                          height: height/2 - 30,
                          width: width/2 - 15
                        }}
                        data={switchData}
                        showLabels={false}
                        showTotal={false}
                        total={switchClientCount}
                        barColors={getDeviceConnectionStatusColorsv2()} />
                      <TenantLink to={'/users/switch/clients'}>
                        {switchClientCount}
                      </TenantLink>
                    </Space>
                    : <div style={{ height: (height/2) - 30 }}/>
                  }
                </GridCol>
              </GridRow>
            </UI.WidgetContainer>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
