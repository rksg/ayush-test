import React from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Card, Table, TableProps }                            from '@acx-ui/components'
import { useGetWifiCallingServiceQuery, useNetworkListQuery } from '@acx-ui/rc/services'
import { useTableQuery, WifiCallingScope }                    from '@acx-ui/rc/utils'

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
  const params = useParams()
  const { $t } = useIntl()
  const basicColumns: TableProps<WifiCallingScope>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'networkName',
      key: 'networkName'
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venues',
      key: 'venues'
    }
  ]

  const { data } = useGetWifiCallingServiceQuery({ params: params })

  const tableQuery = useTableQuery({
    useQuery: useNetworkListQuery,
    defaultPayload
  })

  let basicData = tableQuery.data?.data
    .map((network) => {
      return {
        id: network.id,
        networkName: network.name,
        type: network.nwSubType,
        venues: network.venues.count
      }
    })

  if (data && basicData) {
    const filterNetworkIds = data.hasOwnProperty('networkIds') ? data.networkIds : []
    basicData = basicData.filter((network) => {
      return filterNetworkIds.includes(network.id)
    })
  }

  return (
    <Card title={`${$t({ defaultMessage: 'Instance' })} (${basicData?.length})`}>
      <div style={{ width: '100%' }}>
        <Table
          columns={basicColumns}
          dataSource={basicData}
          pagination={tableQuery.pagination}
          rowKey='id'
        />
      </div>
    </Card>
  )
}

export default WifiCallingNetworksDetail
