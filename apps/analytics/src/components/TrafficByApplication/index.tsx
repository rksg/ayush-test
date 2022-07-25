
import { useGlobalFilter }                                        from '@acx-ui/analytics/utils'
import { Card, Loader, Table, ContentToggle, ContentToggleProps } from '@acx-ui/components'

import { useTrafficByApplicationQuery } from './services'

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
  // eslint-disable-next-line no-console
  console.log('queryResults.data:',queryResults.data)

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
      dataIndex: 'trafficHistory',
      key: 'trafficHistory'
    }
  ])

  const uploadTable = <Table
    columns={columns('upload')}
    dataSource={queryResults.data}
    pagination={false}

  />

  const downloadTable = <Table
    columns={columns('download')}
    dataSource={queryResults.data}
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