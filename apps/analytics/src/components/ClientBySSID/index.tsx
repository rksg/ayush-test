import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'


import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  Card,
  Loader,
  Table,
  NoData,
  SparklineChart } from '@acx-ui/components'
import { formatter } from '@acx-ui/utils'

import { useClientBySSIDQuery, ClientBySSID } from './services'
import { TrafficPercent }                     from './styledComponents'


export default function TrafficBySSIDWidget ({
  filters
}: {
  filters: AnalyticsFilter;
}) {
  const { $t } = useIntl()
  const queryResults = useClientBySSIDQuery(filters,
    {
      selectFromResult: ({ data, ...rest }) => ({
        data,
        ...rest
      })
    }
  )

  const columns=[
    {
      title: 'Application',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Clients',
      dataIndex: 'clientCount',
      key: 'clientCount',
      width: '15%',
      align: 'right' as const
    },
    {
      title: 'Total Traffic',
      dataIndex: 'traffic',
      key: 'traffic',
      width: '20%'
    },
    {
      title: 'Traffic History',
      dataIndex: 'trafficHistory',
      key: 'trafficHistory',
      width: '5%'
    }
  ]

  const getDataSource= (userTrafficData: ClientBySSID[],
    overallTrafic:number) => {
    return userTrafficData.map((item,index) => {
      const sparkLineData = item.timeSeries.userTraffic
        .map(value => value ? value : 0)
      const sparklineChartStyle = { height: 18, width: 80, display: 'inline' }
      return {
        ...item,
        traffic: <>{formatter('bytesFormat')(item.userTraffic)} &nbsp;
          <TrafficPercent>
          ({formatter('percentFormatRound')(item.userTraffic/overallTrafic)})
          </TrafficPercent>
        </>,
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
            <div style={{ display: 'block', height, width }}>
              {ssidTable}
            </div>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}