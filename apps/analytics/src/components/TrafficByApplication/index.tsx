import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'
import styled      from 'styled-components/macro'

import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  Card,
  Loader, Table,
  SparklineChart,
  ContentSwitcher,
  ContentSwitcherProps } from '@acx-ui/components'
import { formatter } from '@acx-ui/utils'

import { useTrafficByApplicationQuery, TrafficByApplicationData } from './services'

const TableBgWhite = styled(Table)`
  .ant-table {
    background-color: white ! important;
  }
  .ant-table-thead > tr > th {
    background: var(--acx-primary-white)
  }
`
const TrafficPercent = styled.span`
  color: var(--acx-neutrals-60);
`

export function TrafficByApplicationWidget ({
  filters
}: {
  filters: AnalyticsFilter;
}) {
  const { $t } = useIntl()
  const queryResults = useTrafficByApplicationQuery(filters,
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

  const getDataSource= (appTrafficData: TrafficByApplicationData[] | undefined,
    overallTrafic:number) => {
    if(!appTrafficData)
      return []

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

  const uploadTable = <TableBgWhite
    columns={columns}
    dataSource={getDataSource(data?.topNAppByUpload, data?.uploadAppTraffic || 1)}
    type={'compact'}
    pagination={false}
  />

  const downloadTable = <TableBgWhite
    columns={columns}
    dataSource={getDataSource(data?.topNAppByDownload, data?.downloadAppTraffic || 1)}
    type={'compact'}
    pagination={false}
  />

  const tabDetails:ContentSwitcherProps['tabDetails']=[
    { label: $t({ defaultMessage: 'Upload' }) , children: uploadTable, value: 'upload' },
    { label: $t({ defaultMessage: 'Download' }), children: downloadTable, value: 'download' }
  ]

  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Top 5 Applications by Traffic' })}>
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