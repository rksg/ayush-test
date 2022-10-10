import { Space }   from 'antd'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  Card,
  Loader,
  Table,
  NoData,
  SparklineChart } from '@acx-ui/components'
import { formatter, intlFormats } from '@acx-ui/utils'

import { useTopSSIDsByClientQuery, TopSSIDsByClient } from './services'
import { TrafficPercent }                             from './styledComponents'


export default function TopSSIDsByClientWidget ({
  filters
}: {
  filters: AnalyticsFilter;
}) {
  const { $t } = useIntl()
  const queryResults = useTopSSIDsByClientQuery(filters)

  const columns=[
    {
      title: $t({ defaultMessage: 'SSID Name' }),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: $t({ defaultMessage: 'Total Traffic' }),
      dataIndex: 'traffic',
      key: 'traffic'
    },
    {
      title: $t({ defaultMessage: 'Traffic History' }),
      dataIndex: 'trafficHistory',
      key: 'trafficHistory'
    },
    {
      title: $t({ defaultMessage: 'Clients' }),
      dataIndex: 'clientCount',
      key: 'clientCount',
      align: 'right' as const
    }
  ]

  const getDataSource= (userTrafficData: TopSSIDsByClient[],
    overallTrafic:number) => {
    return userTrafficData.map((item,index) => {
      const sparkLineData = item.timeSeries.userTraffic
        .map(value => value ? value : 0)
      const sparklineChartStyle = { height: 22, width: 80, display: 'inline' }
      return {
        ...item,
        traffic: <Space align='start' size={4}>
          <>
            {formatter('bytesFormat')(item.userTraffic)}
            <TrafficPercent>
              ({$t(intlFormats.percentFormatRound, { value: item.userTraffic/overallTrafic })})
            </TrafficPercent>
          </>
        </Space>,
        trafficHistory: <SparklineChart
          key={index}
          data={sparkLineData}
          isTrendLine={true}
          style={sparklineChartStyle}/>
      }
    })
  }

  const { data } = queryResults

  const ssidTable = data && data.topNSSIDByClient && data.topNSSIDByClient.length ? <Table
    columns={columns}
    dataSource={getDataSource(data.topNSSIDByClient, data.totalUserTraffic)}
    type={'compact'}
    pagination={false}
  /> : <NoData/>


  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Top 5 SSIDs by Clients' })}>
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'block', height, width, paddingTop: '20px' }}>
              {ssidTable}
            </div>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
