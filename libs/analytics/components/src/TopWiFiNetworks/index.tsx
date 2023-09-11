import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  HistoricalCard,
  Loader,
  NoData,
  DonutChart,
  qualitativeColorSet,
  ContentSwitcher,
  ContentSwitcherProps
} from '@acx-ui/components'
import type { DonutChartData }  from '@acx-ui/components'
import { formatter }            from '@acx-ui/formatter'
import { useNavigateToPath }    from '@acx-ui/react-router-dom'
import type { AnalyticsFilter } from '@acx-ui/utils'

import { HierarchyNodeData, useTopSSIDsByNetworkQuery } from './services'

type WiFiChartData = {
  traffic: DonutChartData[],
  client: DonutChartData[]
}
function getTopWiFiByTrafficChartData (data: HierarchyNodeData): WiFiChartData{
  const trafficChartData: DonutChartData[] = []
  const clientChartData: DonutChartData[] = []
  const colorMapping = qualitativeColorSet()

  if (data && data?.topNSSIDByTraffic?.length > 0) {
    data.topNSSIDByTraffic.forEach(({ name, userTraffic }, i) => {
      trafficChartData.push({
        name,
        value: userTraffic,
        color: colorMapping[i]
      })
    })
  }
  if (data && data?.topNSSIDByClient?.length > 0) {
    data.topNSSIDByClient.forEach(({ name, clientCount }, i) => {
      clientChartData.push({
        name,
        value: clientCount,
        color: colorMapping[i]
      })
    })
  }
  return { traffic: trafficChartData, client: clientChartData }
}

export function dataFormatter (value: unknown){
  return formatter('bytesFormat')(value)
}

export function TopWiFiNetworks ({
  filters
}: {
  filters: AnalyticsFilter;
}) {
  const { $t } = useIntl()
  const queryResults = useTopSSIDsByNetworkQuery(filters,{
    selectFromResult: ({ data, ...rest }) => ({
      data: getTopWiFiByTrafficChartData(data!),
      ...rest
    })
  })
  const clickHandler = useNavigateToPath('/networks')

  const { data } = queryResults
  const isTrafficDataAvailable = data && data.traffic.length > 0
  const isClientDataAvailable = data && data.client.length > 0
  const wifiByTraffic = <AutoSizer>
    {({ height, width }) => (
      isTrafficDataAvailable ?
        <DonutChart
          style={{ width, height: height-30 }}
          data={data.traffic}
          showLegend={true}
          showTotal={false}
          legend='name'
          dataFormatter={dataFormatter}
          size={'x-large'}
          onClick={clickHandler}
        />
        : <NoData style={{ margin: '38px 0 0 0' }}/>
    )}
  </AutoSizer>
  const wifiByClients = <AutoSizer>
    {({ height, width }) => (
      isClientDataAvailable ?
        <DonutChart
          style={{ width, height: height-30 }}
          data={data.client}
          showLegend={true}
          showTotal={false}
          legend='name'
          size={'x-large'}
          onClick={clickHandler}
        />
        : <NoData style={{ margin: '38px 0 0 0' }}/>
    )}
  </AutoSizer>

  const tabDetails:ContentSwitcherProps['tabDetails']=[
    { label: $t({ defaultMessage: 'By Traffic' }) , children: wifiByTraffic, value: 'traffic' },
    { label: $t({ defaultMessage: 'By Clients' }), children: wifiByClients, value: 'clients' }
  ]

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Top Wi-Fi Networks' })}>
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'block', height, width, margin: '-38px 0 0 0' }}>
              <ContentSwitcher tabDetails={tabDetails} align='right' size='small' />
            </div>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
