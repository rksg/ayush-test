
import { useGlobalFilter }                                                        from '@acx-ui/analytics/utils'
import { Card, Loader, Table, SparklineChart, ContentToggle, ContentToggleProps } from '@acx-ui/components'
import { formatter }                                                              from '@acx-ui/utils'

import { useTrafficByApplicationQuery, TrafficByApplicationData } from './services'

export function TrafficByApplicationWidget () {
  const filters = useGlobalFilter()
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
      title: 'Clients',
      dataIndex: 'clientMacCount',
      key: 'clientMacCount'
    },
    {
      title: 'Traffic',
      dataIndex: direction === 'download' ? 'download' : 'upload',
      key: 'traffic'
    },
    {
      title: 'Traffic History',
      dataIndex: direction === 'download' ? 'downloadTrafficHistory' : 'uploadTrafficHistory',
      key: 'trafficHistory'
    }
  ])

  const getDataSource= (data: TrafficByApplicationData[] | undefined) => {
    if(!data)
      return []
    return data.map((item,index) => {
      const uploadSparkLineData = item.timeseries.map(tsDatapoints => tsDatapoints.rxBytes)
      const downloadSparkLineData = item.timeseries.map(tsDatapoints => tsDatapoints.txBytes)
      const sparklineChartStyle = { height: 16, width: '100%', display: 'inline' }
      return {
        ...item,
        upload: formatter('bytesFormat')(item.rxBytes),
        uploadTrafficHistory: <SparklineChart 
          key={index}
          data={uploadSparkLineData}
          style={sparklineChartStyle}/>,
        download: formatter('bytesFormat')(item.txBytes),
        downloadTrafficHistory: <SparklineChart
          key={index}
          data={downloadSparkLineData}
          style={sparklineChartStyle}/>
      }
    })
  }

  // // eslint-disable-next-line no-console
  // console.log('topNAppByUpload:', 
  //   getDataSource(queryResults.data?.topNAppByUpload))
  // // eslint-disable-next-line no-console
  // console.log('topNAppByDownload:', 
  //   getDataSource(queryResults.data?.topNAppByDownload))

  const uploadTable = <Table
    columns={columns('upload')}
    dataSource={getDataSource(queryResults.data?.topNAppByUpload)}
    type={'compact'}
    pagination={false}
  />

  const downloadTable = <Table
    columns={columns('download')}
    dataSource={getDataSource(queryResults.data?.topNAppByDownload)}
    type={'compact'}
    pagination={false}
  />
  
  const tabDetails:ContentToggleProps['tabDetails']=[
    { label: 'Upload', content: uploadTable, value: 'upload' },
    { label: 'Download', content: downloadTable, value: 'download' }
  ]
    
  return (
    <Loader states={[queryResults]}>
      <Card title='Top 5 Applications by Traffic' >
        <ContentToggle tabDetails={tabDetails} size='middle' />
      </Card>
    </Loader>
  )

}