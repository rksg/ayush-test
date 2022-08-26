import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'


import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  Card,
  Loader,
  Table,
  NoData,
  SparklineChart,
  ContentSwitcher,
  ContentSwitcherProps } from '@acx-ui/components'
import { formatter } from '@acx-ui/utils'

import { useTrafficByApplicationQuery, TrafficByApplicationData } from './services'
import { TrafficPercent }                                         from './styledComponents'


export default function TrafficByApplicationWidget ({
  filters
}: {
  filters: AnalyticsFilter;
}) {
  const { $t } = useIntl()
  const queryResults = useTrafficByApplicationQuery(filters)

  const columns=[
    {
      title: $t({ defaultMessage: 'Application' }),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: $t({ defaultMessage: 'Total Traffic' }),
      dataIndex: 'traffic',
      key: 'traffic',
      width: '20%'
    },
    {
      title: $t({ defaultMessage: 'Traffic History' }),
      dataIndex: 'trafficHistory',
      key: 'trafficHistory',
      width: '5%'
    },
    {
      title: $t({ defaultMessage: 'Clients' }),
      dataIndex: 'clientCount',
      key: 'clientCount',
      width: '15%',
      align: 'right' as const
    }
  ]

  const getDataSource= (appTrafficData: TrafficByApplicationData[],
    overallTrafic:number) => {
    return appTrafficData.map((item,index) => {
      const sparkLineData = item.timeSeries.applicationTraffic
        .map(value => value ? value : 0)
      const sparklineChartStyle = { height: 18, width: 80, display: 'inline' }
      return {
        ...item,
        traffic: <>{formatter('bytesFormat')(item.applicationTraffic)} &nbsp;
          <TrafficPercent>
          ({formatter('percentFormatRound')(item.applicationTraffic/overallTrafic)})
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

  const uploadTable = data && data.topNAppByUpload && data.topNAppByUpload.length ? <Table
    columns={columns}
    dataSource={getDataSource(data.topNAppByUpload, data.uploadAppTraffic)}
    type={'compact'}
    pagination={false}
  /> : <NoData/>

  const downloadTable = data && data.topNAppByDownload && data.topNAppByDownload.length ? <Table
    columns={columns}
    dataSource={getDataSource(data.topNAppByDownload, data.downloadAppTraffic)}
    type={'compact'}
    pagination={false}
  /> : <NoData/>

  const tabDetails:ContentSwitcherProps['tabDetails']=[
    { label: $t({ defaultMessage: 'Upload' }) , children: uploadTable, value: 'upload' },
    { label: $t({ defaultMessage: 'Download' }), children: downloadTable, value: 'download' }
  ]

  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Top 5 Applications by Traffic' })}  
        subTitle={$t({ defaultMessage: 'Insight Text coming from analytics' })}>
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'block', height, width }}>
              <ContentSwitcher tabDetails={tabDetails} size='small' align='center' />
            </div>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}