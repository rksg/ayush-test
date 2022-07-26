
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
  const getSparkLineColor = (data:number[]) => {
    const first = data[0]
    const last = data[data.length-1]
    return first > last ? 'red' : 'green'
  }

  const getDataSource= (data: TrafficByApplicationData[] | undefined, overallTrafic:number) => {
    if(!data)
      return []
    return data.map((item,index) => {
      const uploadSparkLineData = item.timeseries.map(tsDatapoints => tsDatapoints.rxBytes)
      const downloadSparkLineData = item.timeseries.map(tsDatapoints => tsDatapoints.txBytes)
      const sparklineChartStyle = { height: 20, width: '100%', display: 'inline' }
      return {
        ...item,
        upload: <span>{formatter('bytesFormat')(item.rxBytes)} &nbsp;
         ({formatter('percentFormatRound')(item.rxBytes/overallTrafic)})</span>,
        uploadTrafficHistory: <SparklineChart 
          color={getSparkLineColor(uploadSparkLineData)}
          key={index}
          data={uploadSparkLineData}
          style={sparklineChartStyle}/>,
        download: <span>{formatter('bytesFormat')(item.txBytes)} &nbsp;
        ({formatter('percentFormatRound')(item.txBytes/overallTrafic)})</span>,
        downloadTrafficHistory: <SparklineChart
          color={getSparkLineColor(downloadSparkLineData)}
          key={index}
          data={downloadSparkLineData}
          style={sparklineChartStyle}/>
      }
    })
  }

  // eslint-disable-next-line no-console
  console.log('queryResults:', queryResults)
  

  const { data } = queryResults

  const uploadTable = <Table
    columns={columns('upload')}
    dataSource={getDataSource(data?.topNAppByUpload, data?.uploadAppTraffic || 1)}
    type={'compact'}
    pagination={false}
  />

  const downloadTable = <Table
    columns={columns('download')}
    dataSource={getDataSource(data?.topNAppByDownload, data?.downloadAppTraffic || 1)}
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