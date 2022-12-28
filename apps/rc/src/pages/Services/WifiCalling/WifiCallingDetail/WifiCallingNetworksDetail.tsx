import React, { useContext, useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Card, Table, TableProps } from '@acx-ui/components'
import { useNetworkListQuery }     from '@acx-ui/rc/services'
import { Network, useTableQuery }  from '@acx-ui/rc/utils'

import { WifiCallingDetailContext } from './WifiCallingDetailView'

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'nwSubType',
    'venues',
    'id'
  ]
}

const WifiCallingNetworksDetail = () => {
  const { $t } = useIntl()
  const basicColumns: TableProps<Network>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      key: 'nwSubType'
    },
    {
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venues',
      key: 'venues',
      renderText: (row) => row.count
    }
  ]

  const { networkIds } = useContext(WifiCallingDetailContext)

  useEffect(() => {
    if (networkIds && networkIds?.length) {
      tableQuery.setPayload({
        ...defaultPayload,
        filters: {
          id: networkIds
        }
      })
    }
  }, [networkIds])

  const tableQuery = useTableQuery({
    useQuery: useNetworkListQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: {
        id: networkIds?.length ? networkIds : ['none']
      }
    }
  })

  let basicData = tableQuery.data?.data
  let totalCount = tableQuery.data?.totalCount

  return (
    <Card title={`${$t({ defaultMessage: 'Instance' })} (${totalCount})`}>
      <div style={{ width: '100%' }}>
        <Table
          columns={basicColumns}
          dataSource={basicData}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
        />
      </div>
    </Card>
  )
}

export default WifiCallingNetworksDetail
