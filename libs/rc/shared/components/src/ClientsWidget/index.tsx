import { Space }              from 'antd'
import { IntlShape, useIntl } from 'react-intl'
import AutoSizer              from 'react-virtualized-auto-sizer'

import { cssStr, Loader, Card , GridRow, GridCol,
  getDeviceConnectionStatusColorsv2, StackedBarChart } from '@acx-ui/components'
import type { DonutChartData }                                  from '@acx-ui/components'
import { Features, useIsSplitOn }                               from '@acx-ui/feature-toggle'
import { useClientSummariesQuery, useGetApWiredClientsQuery }   from '@acx-ui/rc/services'
import { ChartData, Dashboard }                                 from '@acx-ui/rc/utils'
import { useNavigateToPath, useParams, TenantLink }             from '@acx-ui/react-router-dom'
import { useDashboardFilter, useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'

import * as UI from '../DevicesWidget/styledComponents'

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
  const counts = overviewData?.summary?.clients?.summary
  const series: ChartData['series'] = []
  seriesMapping.forEach(({ name }, index) => {
    series.push({
      name: `<${index}>${name}`, // We need to add weightage to maintain the color order on stackbar chart
      value: counts?.[name] || counts?.[name.toLowerCase()] || 0
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

export const getApWiredClientStackedBarChartData = (
  apWiredClientCount: number,
  { $t }: IntlShape
): ChartData[] => {
  const series: ChartData['series'] = []
  series.push({
    name: $t({ defaultMessage: 'Clients' }),
    value: apWiredClientCount || 0
  })
  return [{
    category: '',
    series
  }]
}

export function ClientsWidgetV2 () {
  const onArrowClick = useNavigateToPath('/users/')
  const intl = useIntl()
  const { venueIds } = useDashboardFilter()

  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)
  const isSupportWifiWiredClient = useIsSplitOn(Features.WIFI_WIRED_CLIENT_VISIBILITY_TOGGLE)

  const queryResults = useClientSummariesQuery({
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

  const apWiredClientTableQuery = useGetApWiredClientsQuery({
    payload: {
      filters: {},
      fields: [ 'macAddress']
    }
  })
  const apWiredClientCount = apWiredClientTableQuery.data?.totalCount || 0
  const apWiredData = getApWiredClientStackedBarChartData(apWiredClientCount, intl)

  useTrackLoadTime({
    itemName: widgetsMapping.CLIENTS_WIDGET,
    states: [queryResults],
    isEnabled: isMonitoringPageEnabled
  })

  const switchClientsPath = isSupportWifiWiredClient
    ? '/users/wired/switch/clients'
    : '/users/switch/clients'
  const apClientsPath = '/users/wired/wifi/clients'

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
              {isSupportWifiWiredClient &&
                <GridRow style={{ display: 'flex', alignItems: 'center' }}>
                  <GridCol col={{ span: apWiredClientCount > 0 ? 9 : 12 }}>
                    { apWiredClientCount > 0
                      ? $t({ defaultMessage: 'AP Wired' })
                      : $t({ defaultMessage: 'No AP Wired Clients' })
                    }
                  </GridCol>
                  <GridCol col={{ span: apWiredClientCount > 0 ? 15 : 12 }}>
                    { apWiredClientCount > 0
                      ? <Space>
                        <StackedBarChart
                          animation={false}
                          style={{
                            height: height/2 - 30,
                            width: width/2 - 15
                          }}
                          data={apWiredData}
                          showLabels={false}
                          showTotal={false}
                          total={apWiredClientCount}
                          barColors={getDeviceConnectionStatusColorsv2()} />
                        <TenantLink to={apClientsPath}>
                          {apWiredClientCount}
                        </TenantLink>
                      </Space>
                      : <div style={{ height: (height/2) - 30 }}/>
                    }
                  </GridCol>
                </GridRow>
              }
              <GridRow style={{ display: 'flex', alignItems: 'center' }}>
                <GridCol col={{ span: switchClientCount > 0 ? 9 : 12 }}>
                  { switchClientCount > 0
                    ? (isSupportWifiWiredClient ?
                      $t({ defaultMessage: 'Switch Wired' }) : $t({ defaultMessage: 'Wired' }))
                    : (isSupportWifiWiredClient ?
                      $t({ defaultMessage: 'No Switch Wired Clients' }) :
                      $t({ defaultMessage: 'No Wired Clients' }))
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
                      <TenantLink to={switchClientsPath}>
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
