import styled from 'styled-components/macro'

import { AnalyticsFilter }                                                            from '@acx-ui/analytics/utils'
import { Card, Loader, Table, SparklineChart, ContentSwitcher, ContentSwitcherProps } from '@acx-ui/components'
import { formatter }                                                                  from '@acx-ui/utils'

import { useTrafficByApplicationQuery, TrafficByApplicationData } from './services'

const TableBgWhite = styled(Table)`
  .ant-table {
    background-color: white ! important;
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
  const queryResults = useTrafficByApplicationQuery(filters,
    {
      selectFromResult: ({ data, ...rest }) => ({
        data,
        ...rest
      })
    }
  )
  
  const columns=(direction:string)=>([
    {
      title: 'Application',
      dataIndex: 'appName',
      key: 'appName'
    },
    {
      title: 'Total Traffic',
      dataIndex: direction === 'download' ? 'download' : 'upload',
      key: 'traffic'
    },
    {
      title: 'Traffic History',
      dataIndex: direction === 'download' ? 'downloadTrafficHistory' : 'uploadTrafficHistory',
      key: 'trafficHistory'
    },
    {
      title: 'Clients',
      dataIndex: 'clientMacCount',
      key: 'clientMacCount'
    }
  ])
  
  const getDataSource= (appTrafficData: TrafficByApplicationData[] | undefined,
    overallTrafic:number) => {
    if(!appTrafficData)
      return []

    return appTrafficData.map((item,index) => {
      const uploadSparkLineData = item.timeseries.map(tsDatapoints => tsDatapoints.rxBytes)
      const downloadSparkLineData = item.timeseries.map(tsDatapoints => tsDatapoints.txBytes)
      const sparklineChartStyle = { height: 15, width: '100%', display: 'inline' }
      return {
        ...item,
        upload: <>{formatter('bytesFormat')(item.rxBytes)} &nbsp;
          <TrafficPercent>
          ({formatter('percentFormatRound')(item.rxBytes/overallTrafic)})
          </TrafficPercent>
        </>,
        uploadTrafficHistory: <SparklineChart 
          key={index}
          data={uploadSparkLineData}
          isTrendLine={true}
          style={sparklineChartStyle}/>,
        download: <>{formatter('bytesFormat')(item.txBytes)} &nbsp;
          <TrafficPercent>
          ({formatter('percentFormatRound')(item.txBytes/overallTrafic)})
          </TrafficPercent>
        </>,
        downloadTrafficHistory: <SparklineChart
          key={index}
          data={downloadSparkLineData}
          isTrendLine={true}
          style={sparklineChartStyle}/>
      }
    })
  }

  const { data } = queryResults

  const uploadTable = <TableBgWhite
    columns={columns('upload')}
    dataSource={getDataSource(data?.topNAppByUpload, data?.uploadAppTraffic || 1)}
    type={'compact'}
    pagination={false}
  />

  const downloadTable = <TableBgWhite
    columns={columns('download')}
    dataSource={getDataSource(data?.topNAppByDownload, data?.downloadAppTraffic || 1)}
    type={'compact'}
    pagination={false}
  />
  
  const tabDetails:ContentSwitcherProps['tabDetails']=[
    { label: 'Upload', children: uploadTable, value: 'upload' },
    { label: 'Download', children: downloadTable, value: 'download' }
  ]
    
  return (
    <Loader states={[queryResults]}>
      <Card title='Top 5 Applications by Traffic'>
        <div style={{ display: 'block' }}>
          <ContentSwitcher tabDetails={tabDetails} size='large' align='center' />
        </div>
      </Card>
    </Loader>
  )

}