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

import { useTrafficBySSIDQuery, TrafficBySSID } from './services'
import { TrafficPercent }                       from './styledComponents'


export default function TrafficBySSIDWidget ({
  filters
}: {
  filters: AnalyticsFilter;
}) {
  const { $t } = useIntl()
  const queryResults = useTrafficBySSIDQuery(filters)

  const columns=[
    {
      title: $t({ defaultMessage: 'SSID Name' }),
      dataIndex: 'name',
      key: 'name',
      render: (name:unknown) => {
        return <a href='/#TBD'>{name as string}</a>}
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

  const getDataSource= (appTrafficData: TrafficBySSID[],
    overallTrafic:number) => {
    return appTrafficData.map((item,index) => {
      const sparkLineData = item.timeSeries.userTraffic
        .map(value => value ? value : 0)
      const sparklineChartStyle = { height: 22, width: 80, display: 'inline' }
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

  const ssidTable = data && data.topNSSIDByTraffic && data.topNSSIDByTraffic.length ? <Table
    columns={columns}
    dataSource={getDataSource(data.topNSSIDByTraffic, data.totalUserTraffic)}
    type={'compact'}
    pagination={false}
  /> : <NoData/>


  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Top 5 SSIDs by Traffic' })}
        subTitle={$t({ defaultMessage: 'Insight Text coming from analytics' })}>
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'block', height, width, paddingTop: '10px' }}>
              {ssidTable}
            </div>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}