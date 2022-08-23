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
  const queryResults = useTrafficBySSIDQuery(filters,
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
    },
    {
      title: 'Clients',
      dataIndex: 'clientCount',
      key: 'clientCount',
      width: '15%',
      align: 'right' as const
    }
  ]

  const getDataSource= (appTrafficData: TrafficBySSID[],
    overallTrafic:number) => {
    return appTrafficData.map((item,index) => {
      const sparkLineData = item.timeSeries.map(tsDatapoints => tsDatapoints.traffic)
      const sparklineChartStyle = { height: 18, width: 80, display: 'inline' }
      return {
        ...item,
        traffic: <>{formatter('bytesFormat')(item.traffic)} &nbsp;
          <TrafficPercent>
          ({formatter('percentFormatRound')(item.traffic/overallTrafic)})
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
    dataSource={getDataSource(data.topNSSIDByTraffic, data.totalClientTraffic)}
    type={'compact'}
    pagination={false}
  /> : <NoData/>


  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Top 5 SSIDs by Traffic' })}>
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