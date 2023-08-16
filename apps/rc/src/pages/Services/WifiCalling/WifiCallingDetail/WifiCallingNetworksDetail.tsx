import React, { useContext, useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Card, Table, TableProps }                 from '@acx-ui/components'
import { useNetworkListQuery }                     from '@acx-ui/rc/services'
import { Network, NetworkTypeEnum, useTableQuery } from '@acx-ui/rc/utils'

import { networkTypes } from '../../../Networks/wireless/NetworkForm/contentsMap'

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
      searchable: true,
      key: 'name',
      fixed: 'left',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      key: 'nwSubType',
      sorter: true,
      render: (_, row) => {
        return $t(networkTypes[row.nwSubType as NetworkTypeEnum])
      }
    },
    {
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venues',
      key: 'venues',
      sorter: true,
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

  return (
    <Card title={`${$t({ defaultMessage: 'Instance' })} (${tableQuery.data?.totalCount})`}>
      <div style={{ width: '100%' }}>
        <Table
          columns={basicColumns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
          rowKey='id'
        />
      </div>
    </Card>
  )
}

export default WifiCallingNetworksDetail
